import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaUpload } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import UsernamePopup from '../components/UsernamePopup';
import io from 'socket.io-client';


// Option 1: Direct backend URL in development
const BASE_URL = import.meta.env.MODE === 'development'
? import.meta.env.VITE_API_BASE_URL_DEV // Development URL
: import.meta.env.VITE_API_BASE_URL_PROD; // Production URL

const CHALLENGES_ENDPOINT = `${BASE_URL}/challenges`;

const GuestChallengeView = () => {
  const { user } = useAuthStore();
  const userId = useMemo(() => user?._id, [user]);
  const albumId = useMemo(() => user?.albumId, [user]);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [socket, setSocket] = useState(null);
  const location = useLocation();

  const albumToken = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);

  const initializeSocket = useCallback(() => {
    if (socket) return; // Verhindere erneute Initialisierung des Sockets
    const newSocket = io(BASE_URL);

    newSocket.on('connect', () => {
      newSocket.emit('join_album', albumId || albumToken);
    });
    newSocket.on('challenge_created', (newChallenge) => setChallenges(prev => [...prev, newChallenge]));
    newSocket.on('challenge_deleted', (deletedChallenge) => 
      setChallenges(prev => prev.filter(challenge => challenge._id !== deletedChallenge.id))
    );

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [albumId, albumToken, socket]);

  useEffect(() => {
    if (albumId || albumToken) {
      initializeSocket();
    }
  }, [albumId, albumToken, initializeSocket]);

  const fetchChallenges = useCallback(async (force = false) => {
    const now = Date.now();
    const cacheKey = albumId || albumToken;
    const cachedChallenges = localStorage.getItem(`challenges_${cacheKey}`);
    const lastFetch = localStorage.getItem(`lastFetch_${cacheKey}`);

    if (!force && cachedChallenges && now - lastFetch < 60000) {
      setChallenges(JSON.parse(cachedChallenges));
      return;
    }

    try {
      const res = await axios.get(
        albumToken ? `${CHALLENGES_ENDPOINT}/public/${albumToken}` : CHALLENGES_ENDPOINT,
        albumId ? { params: { albumId }, withCredentials: true } : {}
      );

      setChallenges(res.data);
      localStorage.setItem(`challenges_${cacheKey}`, JSON.stringify(res.data));
      localStorage.setItem(`lastFetch_${cacheKey}`, now);
    } catch (err) {
      setErrorMessage('Error loading challenges.');
      console.error(err);
    }
  }, [albumId, albumToken]);

  useEffect(() => {
    fetchChallenges(true); // Initiales Laden
    const intervalId = setInterval(() => fetchChallenges(), 60000);
    return () => clearInterval(intervalId);
  }, [fetchChallenges]);

  const handleFileSelect = (event, challenge) => {
    if (event.target.files.length === 0) return;
    const imageFile = event.target.files[0];
    setSelectedChallenge({ ...challenge, imageFile, imageUrl: URL.createObjectURL(imageFile) });
    setPendingFile(imageFile);
    setIsPopupVisible(true);
  };

  const onUsernameSubmit = async (username) => {
    if (!selectedChallenge || !(albumId || albumToken) || !pendingFile) return;

    const formData = new FormData();
    formData.append('mediaFile', pendingFile);
    formData.append('albumId', albumId || 'public');
    formData.append('userId', userId || 'guest');
    formData.append('challengeTitle', selectedChallenge.title);
    formData.append('uploaderUsername', username);

    try {
      await axios.post(`${BASE_URL}/api/album-media/upload-media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: albumToken ? { token: albumToken } : {},
        withCredentials: !!albumId
      });

      alert('Image uploaded successfully!');
      setIsPopupVisible(false);
      setSelectedChallenge(null);
      setPendingFile(null);
    } catch (err) {
      setErrorMessage('Upload failed.');
      console.error(err);
    }
  };

  return (
    <Layout>
      {isPopupVisible && <UsernamePopup onSubmit={onUsernameSubmit} onClose={() => setIsPopupVisible(false)} />}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="heading-xl text-gradient">Guest Challenge View</h1>
          <p className="text-base text-gray-300">Select an image for each challenge and upload.</p>
        </div>
        {errorMessage ? (
          <div className="text-center text-red-400">{errorMessage}</div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge._id}
                challenge={challenge}
                handleFileSelect={handleFileSelect}
                selectedChallenge={selectedChallenge}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-300">No challenges available at the moment.</div>
        )}
      </motion.div>
    </Layout>
  );
};

const ChallengeCard = React.memo(({ challenge, handleFileSelect, selectedChallenge }) => (
  <motion.div className="bg-card rounded-xl p-4 shadow-md transition-all">
    <h3 className="text-lg font-bold text-light">{challenge.title}</h3>
    <div className="mt-4 space-y-2">
      <label className="flex items-center justify-center bg-gray-700 text-white rounded py-1 text-sm cursor-pointer shadow-sm hover:bg-gray-600 transition">
        <FaUpload className="mr-1" /> Select Image
        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, challenge)} />
      </label>
      {selectedChallenge && selectedChallenge._id === challenge._id && selectedChallenge.imageFile && (
        <img src={selectedChallenge.imageUrl} alt="Preview" className="w-full h-auto rounded mt-2" />
      )}
    </div>
  </motion.div>
));

export default React.memo(GuestChallengeView);

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FaUpload } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import UsernamePopup from '../components/UsernamePopup';

const BASE_URL = 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000';

const GuestChallengeView = () => {
  const { user } = useAuthStore();
  const userId = useMemo(() => user ? user._id : null, [user]);
  const albumId = useMemo(() => user ? user.albumId : null, [user]);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const albumToken = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('token');
  }, [location.search]);

  const fetchChallenges = useCallback(async () => {
    try {
      let res;
      if (albumToken) {
        console.log('Fetching challenges with album token:', albumToken);
        res = await axios.get(`${BASE_URL}/challenges/public/${albumToken}`);
      } else if (albumId) {
        console.log('Fetching challenges with albumId:', albumId);
        res = await axios.get(`${BASE_URL}/challenges`, {
          params: { albumId },
          withCredentials: true
        });
      } else {
        throw new Error('No album token or album ID provided');
      }
      console.log('Challenges fetched:', res.data);
      setChallenges(res.data);
    } catch (err) {
      console.error('Error fetching challenges:', err.response?.data || err.message);
      setErrorMessage(`Failed to load challenges: ${err.response?.data?.message || err.message}`);
    }
  }, [albumId, albumToken]);
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleFileSelect = useCallback((event, challenge) => {
    if (!event.target.files.length) return;

    const imageFile = event.target.files[0];
    const imageUrl = URL.createObjectURL(imageFile);
    setSelectedChallenge({ ...challenge, imageFile, imageUrl });

    setPendingFile(imageFile);
    setIsPopupVisible(true);
  }, []);

  const onUsernameSubmit = useCallback(async (username) => {
    if (!selectedChallenge || !(albumId || albumToken) || !pendingFile) return;

    const confirmUpload = window.confirm("Are you sure you want to upload this image?");
    if (!confirmUpload) return;

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
      console.error('Error uploading image:', err);
      setErrorMessage('Upload failed. Please try again.');
    }
  }, [selectedChallenge, albumId, albumToken, pendingFile, userId]);

  const ChallengeCard = useCallback(({ challenge }) => (
    <div key={challenge._id} className="bg-card rounded-xl p-4 shadow-md transition-all">
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
    </div>
  ), [handleFileSelect, selectedChallenge]);

  return (
    <Layout>
      {isPopupVisible && <UsernamePopup onSubmit={onUsernameSubmit} onClose={() => setIsPopupVisible(false)} />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 md:p-8 pb-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="heading-xl text-gradient">
            Guest Challenge View
          </h1>
          <p className="text-base text-gray-300">
            Select an image for each challenge and upload.
          </p>
        </div>

        {errorMessage ? (
          <div className="text-center text-red-400">{errorMessage}</div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge._id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-300">No challenges available at the moment.</div>
        )}
      </motion.div>
    </Layout>
  );
};

export default React.memo(GuestChallengeView);
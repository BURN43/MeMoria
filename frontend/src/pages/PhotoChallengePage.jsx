import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';
import io from 'socket.io-client';


// Option 1: Direct backend URL in development
const API_URL = import.meta.env.MODE === 'development'
? import.meta.env.VITE_API_BASE_URL_DEV // Development URL
: import.meta.env.VITE_API_BASE_URL_PROD; // Production URL

const CHALLENGES_ENDPOINT = `${API_URL}/challenges`;

const PhotoChallengePage = () => {
  const { user } = useAuthStore();
  const isAdmin = useMemo(() => user && user.role === 'admin', [user]);
  const albumId = useMemo(() => user ? user.albumId : null, [user]);
  const [challenges, setChallenges] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [socket, setSocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isAdmin && albumId) {
      const newSocket = io(API_URL);
      newSocket.on('connect', () => {
        console.log('WebSocket connected');
        newSocket.emit('join_album', albumId);
      });
      newSocket.on('challenge_created', handleChallengeCreated);
      newSocket.on('challenge_deleted', handleChallengeDeleted);
      setSocket(newSocket);

      return () => {
        newSocket.off('challenge_created', handleChallengeCreated);
        newSocket.off('challenge_deleted', handleChallengeDeleted);
        newSocket.close();
      };
    }
  }, [isAdmin, albumId]);

  const fetchChallenges = useCallback(async () => {
    if (!isAdmin || !albumId) return;
    try {
      const cachedChallenges = localStorage.getItem(`challenges_${albumId}`);
      const cachedTimestamp = localStorage.getItem(`challenges_${albumId}_timestamp`);

      if (cachedChallenges && cachedTimestamp) {
        const now = Date.now();
        if (now - parseInt(cachedTimestamp) < 60000) { // 1 minute cache
          setChallenges(JSON.parse(cachedChallenges));
          return;
        }
      }

      const res = await axios.get(`${CHALLENGES_ENDPOINT}?albumId=${albumId}`);
      setChallenges(res.data);
      localStorage.setItem(`challenges_${albumId}`, JSON.stringify(res.data));
      localStorage.setItem(`challenges_${albumId}_timestamp`, Date.now().toString());
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }, [isAdmin, albumId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleChallengeCreated = useCallback((newChallenge) => {
    if (newChallenge.albumId === albumId) {
      setChallenges(prevChallenges => {
        const updatedChallenges = [...prevChallenges, newChallenge];
        localStorage.setItem(`challenges_${albumId}`, JSON.stringify(updatedChallenges));
        return updatedChallenges;
      });
    }
  }, [albumId]);

  const handleChallengeDeleted = useCallback((deletedChallenge) => {
    if (deletedChallenge.albumId === albumId) {
      setChallenges(prevChallenges => {
        const updatedChallenges = prevChallenges.filter(challenge => challenge._id !== deletedChallenge.id);
        localStorage.setItem(`challenges_${albumId}`, JSON.stringify(updatedChallenges));
        return updatedChallenges;
      });
    }
  }, [albumId]);

  const deleteChallenge = useCallback(async (id) => {
    // Optimistic update
    setChallenges(prevChallenges => prevChallenges.filter(challenge => challenge._id !== id));

    try {
      await axios.delete(`${CHALLENGES_ENDPOINT}/${id}`);
      // The actual update will be handled by the WebSocket event
    } catch (err) {
      console.error('Error deleting challenge:', err);
      // Revert the optimistic update
      fetchChallenges();
    }
  }, [fetchChallenges]);

  const addNewChallenge = useCallback(async () => {
    if (newTitle && albumId) {
      // Optimistic update
      const tempId = Date.now().toString();
      const tempChallenge = { _id: tempId, title: newTitle, albumId };
      setChallenges(prevChallenges => [...prevChallenges, tempChallenge]);

      try {
        const res = await axios.post(CHALLENGES_ENDPOINT, { title: newTitle, albumId });
        // The actual update will be handled by the WebSocket event
        setNewTitle('');
      } catch (err) {
        console.error('Error adding challenge:', err);
        // Revert the optimistic update
        setChallenges(prevChallenges => prevChallenges.filter(challenge => challenge._id !== tempId));
      }
    }
  }, [newTitle, albumId]);

  if (!isAdmin) {
    return <div>Access Denied: Admins only</div>;
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="heading-xl text-gradient">
            Photo Challenges
          </h1>
          <p className="text-base text-gray-300">
            Create and manage photo challenges for your event guests.
          </p>
        </div>

        {/* Add New Challenge */}
        <div className="bg-card rounded-xl p-8 shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="heading-lg text-gray-200">Add New Challenge</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter challenge title"
              className="input"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button onClick={addNewChallenge} className="button">
              Add Challenge
            </button>
          </div>
        </div>

        {/* Challenges List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge._id}
              challenge={challenge}
              deleteChallenge={deleteChallenge}
            />
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

const ChallengeCard = React.memo(({ challenge, deleteChallenge }) => (
  <motion.div
    className="bg-card rounded-xl p-6 shadow-lg relative"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4">
      <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
    </div>

    <div className="flex justify-end mt-4">
      <button
        onClick={() => deleteChallenge(challenge._id)}
        className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
      >
        Delete
      </button>
    </div>
  </motion.div>
));

export default React.memo(PhotoChallengePage);
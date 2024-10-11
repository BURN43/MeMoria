import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/Layout';

const API_URL = 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000/challenges';

const PhotoChallengePage = () => {
  const { user } = useAuthStore();
  const isAdmin = useMemo(() => user && user.role === 'admin', [user]);
  const albumId = useMemo(() => user ? user.albumId : null, [user]);
  const [challenges, setChallenges] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  const fetchChallenges = useCallback(async () => {
    if (!isAdmin || !albumId) return;
    try {
      const res = await axios.get(`${API_URL}?albumId=${albumId}`);
      setChallenges(res.data);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }, [isAdmin, albumId]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const deleteChallenge = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setChallenges(challenges => challenges.filter(challenge => challenge._id !== id));
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  }, []);

  const addNewChallenge = useCallback(async () => {
    if (newTitle && albumId) {
      try {
        const res = await axios.post(API_URL, { title: newTitle, albumId });
        setChallenges(challenges => [...challenges, res.data]);
        setNewTitle('');
      } catch (err) {
        console.error('Error adding challenge:', err);
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
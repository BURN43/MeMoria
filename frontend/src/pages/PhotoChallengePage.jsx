import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';  // Assuming auth store provides admin info and albumId
import Layout from '../components/Layout';

const PhotoChallengePage = () => {
  const { user } = useAuthStore();
  const isAdmin = user && user.role === 'admin';
  const albumId = user ? user.albumId : null;
  const [challenges, setChallenges] = useState([]);
  const [editedTitle, setEditedTitle] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const API_URL = 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000/challenges';

  useEffect(() => {
    if (!isAdmin || !albumId) return; // Ensure only admins with a valid albumId can fetch challenges

    const fetchChallenges = async () => {
      try {
        const res = await axios.get(`${API_URL}?albumId=${albumId}`); // Fetch challenges by admin's albumId
        setChallenges(res.data);
      } catch (err) {
        console.error('Error fetching challenges:', err);
      }
    };
    fetchChallenges();
  }, [isAdmin, albumId]);

  const enableEditing = (id, title) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge._id === id ? { ...challenge, isEditing: true } : challenge
      )
    );
    setEditedTitle(title);
  };

  const saveChanges = async (id) => {
    try {
      const updatedChallenge = { title: editedTitle };
      const res = await axios.patch(`${API_URL}/${id}`, updatedChallenge);
      setChallenges(challenges.map((challenge) =>
        challenge._id === id ? { ...res.data, isEditing: false } : challenge
      ));
    } catch (err) {
      console.error('Error saving changes:', err);
    }
  };

  const cancelEditing = (id) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge._id === id ? { ...challenge, isEditing: false } : challenge
      )
    );
  };

  const deleteChallenge = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setChallenges(challenges.filter((challenge) => challenge._id !== id));
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  };

  const addNewChallenge = async () => {
    if (newTitle && albumId) {
      try {
        const res = await axios.post(API_URL, { title: newTitle, albumId });
        setChallenges([...challenges, res.data]);
        setNewTitle('');
      } catch (err) {
        console.error('Error adding challenge:', err);
      }
    }
  };

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
            <motion.div
              key={challenge._id}
              className="bg-card rounded-xl p-6 shadow-lg relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Editable Title */}
              <div className="mb-4">
                {challenge.isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-xl font-bold bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500 text-white w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-around mt-4">
                {challenge.isEditing ? (
                  <>
                    <button
                      onClick={() => saveChanges(challenge._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEditing(challenge._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => enableEditing(challenge._id, challenge.title)}
                      className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteChallenge(challenge._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default PhotoChallengePage;
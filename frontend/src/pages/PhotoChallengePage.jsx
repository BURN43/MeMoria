// src/pages/PhotoChallengePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { FaPencilAlt, FaSave } from 'react-icons/fa'; // Icons for editing and saving

const PhotoChallengePage = () => {
  const [challenges, setChallenges] = useState([
    { id: 1, title: 'Challenge 1', description: 'Take a photo with the bride and groom', isEditing: false },
    { id: 2, title: 'Challenge 2', description: 'Capture a funny moment', isEditing: false },
  ]);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const enableEditing = (id, title, description) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === id ? { ...challenge, isEditing: true } : challenge
      )
    );
    setEditedTitle(title);
    setEditedDescription(description);
  };

  const saveChanges = (id) => {
    setChallenges(
      challenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, title: editedTitle, description: editedDescription, isEditing: false }
          : challenge
      )
    );
  };

  const deleteChallenge = (id) => {
    setChallenges(challenges.filter((challenge) => challenge.id !== id));
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Photo Challenges
          </h1>
          <p className="text-lg text-gray-300">
            Create and manage photo challenges for your event guests.
          </p>
        </div>

        {/* Add New Challenge */}
        <div className="bg-gray-900 rounded-xl p-8 shadow-xl max-w-3xl mx-auto mb-8">
          <h2 className="text-3xl text-white font-extrabold mb-6">Add New Challenge</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter challenge title"
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg mb-4"
            />
            <textarea
              placeholder="Enter challenge description"
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg"
            />
          </div>
          <div className="text-center">
            <button
              className="py-3 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
            >
              Add Challenge
            </button>
          </div>
        </div>

        {/* Challenges List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Editing Controls */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {challenge.isEditing ? (
                  <button
                    onClick={() => saveChanges(challenge.id)}
                    className="text-green-400 hover:text-green-500"
                  >
                    <FaSave className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => enableEditing(challenge.id, challenge.title, challenge.description)}
                    className="text-gray-400 hover:text-purple-500"
                  >
                    <FaPencilAlt className="w-5 h-5" />
                  </button>
                )}
              </div>

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

              {/* Editable Description */}
              <div className="mb-4">
                {challenge.isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full bg-transparent text-white border-b border-gray-500 focus:outline-none focus:border-blue-500"
                    rows="3"
                  />
                ) : (
                  <p className="text-gray-300">{challenge.description}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => deleteChallenge(challenge.id)}
                  className="py-2 px-4 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default PhotoChallengePage;

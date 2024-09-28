// src/pages/GuestChallengeView.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { FaCamera, FaCheckCircle } from 'react-icons/fa'; // Import für Icons

const GuestChallengeView = () => {
  const [challenges] = useState([
    { id: 1, title: 'Challenge 1', description: 'Take a photo with the bride and groom' },
    { id: 2, title: 'Challenge 2', description: 'Capture a funny moment' },
  ]);
  const [uploads, setUploads] = useState({});
  const [preview, setPreview] = useState({});
  const [submitted, setSubmitted] = useState({});

  const handleFileChange = (challengeId, file) => {
    setUploads((prev) => ({
      ...prev,
      [challengeId]: file,
    }));

    // Create a preview of the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview((prev) => ({
        ...prev,
        [challengeId]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEntry = (challengeId) => {
    if (uploads[challengeId]) {
      setSubmitted((prev) => ({
        ...prev,
        [challengeId]: true,
      }));
      alert(`Foto für Challenge ${challengeId} erfolgreich hochgeladen!`);
    } else {
      alert('Bitte laden Sie ein Bild hoch, bevor Sie absenden.');
    }
  };

  const handleFileInputClick = (challengeId) => {
    document.getElementById(`file-input-${challengeId}`).click();
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Event Photo Challenges
          </h1>
          <p className="text-lg text-gray-300">
            Participate in our fun photo challenges! Upload a picture and submit your entry.
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                {/* Title */}
                <h2 className="text-3xl font-extrabold text-blue-400 md:text-4xl bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
                  {challenge.title}
                </h2>
                <FaCamera className="text-3xl text-purple-500" />
              </div>

              {/* Description */}
              <p className="text-lg text-gray-200 mb-6 bg-gray-700 py-2 px-4 rounded-lg">
                {challenge.description}
              </p>

              {/* Image Preview */}
              {preview[challenge.id] && (
                <div className="mb-4">
                  <img
                    src={preview[challenge.id]}
                    alt="Preview"
                    className="rounded-lg border border-gray-700 max-w-full h-auto"
                  />
                </div>
              )}

              {/* Upload Button */}
              {!submitted[challenge.id] ? (
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="file"
                    id={`file-input-${challenge.id}`}
                    accept="image/*"
                    onChange={(e) => handleFileChange(challenge.id, e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    onClick={() => handleFileInputClick(challenge.id)}
                    className="w-full md:w-auto bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Foto hochladen
                  </button>

                  <button
                    onClick={() => handleSubmitEntry(challenge.id)}
                    className="w-full md:w-auto bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-300"
                  >
                    Absenden
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FaCheckCircle className="text-green-500 text-2xl" />
                  <p className="text-green-500">Challenge abgeschlossen!</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
};

export default GuestChallengeView;

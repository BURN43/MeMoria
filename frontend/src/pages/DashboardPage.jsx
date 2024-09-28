// src/pages/DashboardPage.jsx
import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


const DashboardPage = () => {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            Welcome to Your Event Album Platform
          </h1>
          <p className="text-sm md:text-lg text-gray-100 mb-6">
            Manage your event photos, challenges, and customize your album easily.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {/* Step 1: Set Up Your Album */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-xl shadow-lg mb-4"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-blue-400">Album Settings</h2>
            <p className="text-gray-400 text-sm mb-6">
              Customize your album settings and manage details.
            </p>
            <Link
              to="/settings"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 mt-6"
            >
              Manage Album
            </Link>
          </motion.div>

          {/* Step 2: Engage with Photo Challenges */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-xl shadow-lg mb-4"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-blue-400">Photo Challenges</h2>
            <p className="text-gray-400 text-sm mb-6">
              Create and view fun photo challenges for your event.
            </p>
            <Link
              to="/photo-challenge"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 mt-6"
            >
              View Challenges
            </Link>
          </motion.div>

          {/* Step 3: Share and Download Album */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-xl shadow-lg"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-3 text-blue-400">Design Your QR-CODE</h2>
            <p className="text-gray-400 text-sm mb-6">
              Design your Qr-Code and Share your it with your guests or download it.
            </p>
            <Link
              to="/Design-Table-Stand"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 mt-6"
            >
              Share/Download
            </Link>
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-xl shadow-lg mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-100">Album Progress</h2>
          <p className="text-gray-400">150 of 500 photos uploaded</p>
          <progress className="w-full" value="150" max="500"></progress>
        </div>

        {/* Package Information */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl p-8 rounded-xl shadow-lg mt-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-100">Current Package</h2>
          <p className="text-gray-400 mb-6">
            You are on the <strong>Basic Package</strong>. Upgrade for more features.
          </p>
          <Link
            to="/expand-package"
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-3 px-8 rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-700 transition duration-300 mt-6"
          >
            Upgrade Package
          </Link>
        </div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage;

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
          <h1 className="heading-xl text-gradient">
            Welcome to Your Event Album Platform
          </h1>
          <p className="text-base md:text-lg text-gray-100 mb-6">
            Manage your event photos, challenges, and customize your album easily.
          </p>
        </div>

        {/* Steps Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {/* Step 1: Album Settings */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-6 md:p-8 rounded-xl shadow-lg mb-4"
          >
            <h2 className="heading-lg text-blue-400">Album Settings</h2>
            <p className="text-gray-400 text-sm mb-4">
              Customize your album settings and manage details.
            </p>
            <Link
              to="/settings"
              className="button"
            >
              Manage Album
            </Link>
          </motion.div>

          {/* Step 2: Photo Challenges */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-6 md:p-8 rounded-xl shadow-lg mb-4"
          >
            <h2 className="heading-lg text-blue-400">Photo Challenges</h2>
            <p className="text-gray-400 text-sm mb-4">
              Create and view fun photo challenges for your event.
            </p>
            <Link
              to="/photo-challenge"
              className="button"
            >
              View Challenges
            </Link>
          </motion.div>

          {/* Step 3: Design Your QR-CODE */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-card p-6 md:p-8 rounded-xl shadow-lg mb-4"
          >
            <h2 className="heading-lg text-blue-400">Design Your QR-CODE</h2>
            <p className="text-gray-400 text-sm mb-4">
              Design your QR-Code and share it with your guests.
            </p>
            <Link
              to="/design-table-stand"
              className="button"
            >
              Share/Download
            </Link>
          </motion.div>
        </div>

        {/* Progress Section */}
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8">
          <h2 className="heading-lg text-gray-100">Album Progress</h2>
          <p className="text-gray-400 mb-2">150 of 500 photos uploaded</p>
          <progress className="w-full" value="150" max="500"></progress>
        </div>

        {/* Package Information */}
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8 text-center">
          <h2 className="heading-lg text-gray-100">Current Package</h2>
          <p className="text-gray-400 mb-6">
            You are on the <strong>Basic Package</strong>. Upgrade for more features.
          </p>
          <Link
            to="/expand-package"
            className="button bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            Upgrade Package
          </Link>
        </div>
      </motion.div>
    </Layout>
  );
};

export default DashboardPage;
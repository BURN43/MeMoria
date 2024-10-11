import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Assuming you're using axios for API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000';

const DashboardPage = () => {
  const [albumProgress, setAlbumProgress] = useState({ uploaded: 0, total: 0 });
  const [currentPackage, setCurrentPackage] = useState('');

  const fetchDashboardData = useCallback(async () => {
    const cachedData = localStorage.getItem('dashboardData');
    const cachedTimestamp = localStorage.getItem('dashboardDataTimestamp');
    const currentTime = new Date().getTime();

    if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < 3600000) {
      // Use cached data if it's less than an hour old
      const parsedData = JSON.parse(cachedData);
      setAlbumProgress(parsedData.albumProgress);
      setCurrentPackage(parsedData.currentPackage);
    } else {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          withCredentials: true,
        });
        const dashboardData = response.data;
        setAlbumProgress(dashboardData.albumProgress);
        setCurrentPackage(dashboardData.currentPackage);

        // Cache the fetched data
        localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
        localStorage.setItem('dashboardDataTimestamp', currentTime.toString());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoize the step components to prevent unnecessary re-renders
  const StepComponent = React.memo(({ title, description, linkTo, linkText }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card p-6 md:p-8 rounded-xl shadow-lg mb-4"
    >
      <h2 className="heading-lg text-blue-400">{title}</h2>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <Link to={linkTo} className="button">{linkText}</Link>
    </motion.div>
  ));

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
          <StepComponent
            title="Album Settings"
            description="Customize your album settings and manage details."
            linkTo="/settings"
            linkText="Manage Album"
          />
          <StepComponent
            title="Photo Challenges"
            description="Create and view fun photo challenges for your event."
            linkTo="/photo-challenge"
            linkText="View Challenges"
          />
          <StepComponent
            title="Design Your QR-CODE"
            description="Design your QR-Code and share it with your guests."
            linkTo="/design-table-stand"
            linkText="Share/Download"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8">
          <h2 className="heading-lg text-gray-100">Album Progress</h2>
          <p className="text-gray-400 mb-2">
            {albumProgress.uploaded} of {albumProgress.total} photos uploaded
          </p>
          <progress 
            className="w-full" 
            value={albumProgress.uploaded} 
            max={albumProgress.total}
          ></progress>
        </div>

        {/* Package Information */}
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8 text-center">
          <h2 className="heading-lg text-gray-100">Current Package</h2>
          <p className="text-gray-400 mb-6">
            You are on the <strong>{currentPackage}</strong>. Upgrade for more features.
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

export default React.memo(DashboardPage);
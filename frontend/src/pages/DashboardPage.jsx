import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD;

const DashboardPage = () => {
  const [albumProgress, setAlbumProgress] = useState({ uploaded: 0, total: 0 });
  const [currentPackage, setCurrentPackage] = useState('');

  const fetchDashboardData = useCallback(async () => {
    const cachedData = localStorage.getItem('dashboardData');
    const cachedTimestamp = localStorage.getItem('dashboardDataTimestamp');
    const currentTime = new Date().getTime();

    if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < 3600000) {
      const parsedData = JSON.parse(cachedData);
      setAlbumProgress(parsedData.albumProgress);
      setCurrentPackage(parsedData.currentPackage);
    } else {
      try {
        const response = await axios.get(`${API_URL}/dashboard`, { withCredentials: true });
        const dashboardData = response.data;
        setAlbumProgress(dashboardData.albumProgress);
        setCurrentPackage(dashboardData.currentPackage);

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
  const StepComponent = React.memo(({ title, description, linkTo, linkText }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card mb-4 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold text-primary mb-2">{title}</h2>
      <p className="text-secondary text-sm mb-4">{description}</p>
      <Link to={linkTo} className="button button-primary">{linkText}</Link>
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
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            Welcome to Your Event Album Platform
          </h1>
          <p className="text-lg text-secondary mb-6">
            Manage your event photos, challenges, and customize your album easily.
          </p>
        </div>
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
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">Album Progress</h2>
          <p className="text-secondary mb-2">
            {albumProgress.uploaded} of {albumProgress.total} photos uploaded
          </p>
          <progress 
            className="w-full progress-primary" 
            value={albumProgress.uploaded} 
            max={albumProgress.total}
          ></progress>
        </div>
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg mt-8 text-center">
          <h2 className="text-2xl font-semibold text-primary mb-4">Current Package</h2>
          <p className="text-lg text-secondary mb-6">
            You are on the <strong>{currentPackage}</strong>. Upgrade for more features.
          </p>
          <Link
            to="/paket-erweitern"
            className="button button-accent"
          >
            Upgrade Package
          </Link>
        </div>
      </motion.div>
    </Layout>
  );
  };
  export default React.memo(DashboardPage);

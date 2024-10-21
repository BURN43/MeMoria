import React, { useEffect } from 'react';
import axios from 'axios';

// Define the API URL based on the environment
const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD;

const ThemeLoader = () => {
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        // Fetch theme settings from the server
        const response = await axios.get(`${API_URL}/settings`, {
          withCredentials: true // Include credentials if necessary
        });

        // Retrieve and apply the theme
        const settingsData = response.data;
        const userTheme = settingsData.theme || 'default';
        document.documentElement.setAttribute('data-theme', userTheme);

        // Store the theme in localStorage for persistence
        localStorage.setItem('preferredTheme', userTheme);
      } catch (error) {
        console.error('Error fetching theme settings:', error);
        // No fallback to stored theme
      }
    };

    fetchTheme(); // Always fetch from the server on component mount
  }, []); // Dependency array ensures this runs once when the component mounts

  return null; // This component does not render anything in the DOM
};

export default ThemeLoader;
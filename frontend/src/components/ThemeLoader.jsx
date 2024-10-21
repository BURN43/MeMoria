import React, { useEffect } from 'react';
import axios from 'axios';

// Define the API URL based on the environment
const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD;

const ThemeLoader = () => {
  useEffect(() => {
    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('preferredTheme', theme);
    };

    const fetchTheme = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`, {
          withCredentials: true 
        });

        const settingsData = response.data;
        const userTheme = settingsData.theme || 'default';
        applyTheme(userTheme);
      } catch (error) {
        console.error('Error fetching theme settings:', error);

        // Try to apply cached theme if fetch fails
        const cachedTheme = localStorage.getItem('preferredTheme') || 'default';
        applyTheme(cachedTheme);
      }
    };

    // Check local storage for the theme
    const storedTheme = localStorage.getItem('preferredTheme');
    if (storedTheme) {
      applyTheme(storedTheme);
    } else {
      fetchTheme();
    }
  }, []); // Dependency array ensures this runs once when the component mounts

  return null; // This component does not render anything in the DOM
};

export default ThemeLoader;
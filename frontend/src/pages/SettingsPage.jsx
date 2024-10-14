import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';

// Option 1: Direct backend URL in development
const API_URL = import.meta.env.MODE === 'development'
? import.meta.env.VITE_API_BASE_URL_DEV // Development URL
: import.meta.env.VITE_API_BASE_URL_PROD; // Production URL
console.log("API URL:", API_URL);


const defaultSettings = {
  albumTitle: '',
  eventDate: '',
  eventTime: '',
  greetingText: '',
  guestInfo: '',
  GuestUploadsImage: true,
  GuestUploadsVideo: true,
  Guestcomments: false,
  GuestDownloadOption: false,
};

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [settings, setSettings] = useState(() => {
    const cachedSettings = localStorage.getItem('albumSettings');
    return cachedSettings ? JSON.parse(cachedSettings) : defaultSettings;
  });
  const [countdown, setCountdown] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    const handleReconnect = () => {
      console.log('WebSocket reconnected');
      fetchSettings(true);
    };

    newSocket.on('connect', handleReconnect);

    return () => {
      newSocket.off('connect', handleReconnect);
      newSocket.close();
    };
  }, []);

  const fetchSettings = useCallback(async (force = false) => {
    if (!force && !isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/settings`, {
        withCredentials: true,
      });
      const settingsData = response.data;
      const formattedSettings = {
        ...settingsData,
        eventDate: settingsData.eventDate
          ? new Date(settingsData.eventDate).toISOString().split('T')[0]
          : '',
      };

      if (JSON.stringify(formattedSettings) !== JSON.stringify(settings)) {
        setSettings(formattedSettings);
        localStorage.setItem('albumSettings', JSON.stringify(settingsData));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setFeedbackMessage('Failed to fetch settings. Using cached data.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (socket) {
      const handleSettingsUpdate = (updatedSettings) => {
        const formattedSettings = {
          ...updatedSettings,
          eventDate: updatedSettings.eventDate
            ? new Date(updatedSettings.eventDate).toISOString().split('T')[0]
            : '',
        };

        if (JSON.stringify(formattedSettings) !== JSON.stringify(settings)) {
          setSettings(formattedSettings);
          localStorage.setItem('albumSettings', JSON.stringify(updatedSettings));
          setFeedbackMessage('Settings updated!');
          setTimeout(() => setFeedbackMessage(''), 3000);
        }
      };

      const handleSettingsDelete = () => {
        setSettings(defaultSettings);
        localStorage.removeItem('albumSettings');
        setFeedbackMessage('Settings have been deleted by an admin.');
        setTimeout(() => setFeedbackMessage(''), 3000);
      };

      socket.on('settings_updated', handleSettingsUpdate);
      socket.on('settings_deleted', handleSettingsDelete);

      return () => {
        socket.off('settings_updated', handleSettingsUpdate);
        socket.off('settings_deleted', handleSettingsDelete);
      };
    }
  }, [socket, settings]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsModified(true);
  }, []);

  const saveSettings = async () => {
    try {
      await axios.put(`${API_URL}/api/settings`, settings, {
        withCredentials: true,
      });
      localStorage.setItem('albumSettings', JSON.stringify(settings));
      setFeedbackMessage('Settings saved successfully!');
      setTimeout(() => setFeedbackMessage(''), 3000);
      setIsModified(false);

      if (socket && socket.connected) {
        socket.emit('settings_updated', settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setFeedbackMessage('Error saving settings. Please try again.');
    }
  };

  useEffect(() => {
    if (settings.eventDate) {
      const interval = setInterval(() => {
        const eventDateTime = settings.eventTime ? `${settings.eventDate}T${settings.eventTime}` : settings.eventDate;
        const eventTimeMs = new Date(eventDateTime).getTime();
        const currentTimeMs = new Date().getTime();
        const timeLeft = eventTimeMs - currentTimeMs;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown('The Event is Live!');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [settings.eventDate, settings.eventTime]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
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
            Album Settings
          </h1>
          <p className="text-base text-gray-200">
            Customize your album settings and manage the details for your event.
          </p>
        </div>

        {feedbackMessage && (
          <div className={`text-center ${feedbackMessage.includes('Error') ? 'text-red-500' : 'text-green-500'} text-lg mb-4`}>
            {feedbackMessage}
          </div>
        )}

        <div className="bg-card p-8 shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="heading-lg text-gray-200">Event and Album Details</h2>

          <label className="block text-gray-400 text-sm mb-2">Title</label>
          <input
            type="text"
            style={{ textTransform: 'uppercase' }}
            name="albumTitle"
            value={settings.albumTitle || ''}
            onChange={handleInputChange}
            className="input"
            placeholder="Enter album title"
          />

          <label className="block text-gray-400 text-sm mb-2">Event Date</label>
          <input
            type="date"
            name="eventDate"
            value={settings.eventDate || ''}
            onChange={handleInputChange}
            className="input"
          />

          <label className="block text-gray-400 text-sm mb-2">Event Time (optional)</label>
          <input
            type="time"
            name="eventTime"
            value={settings.eventTime || ''}
            onChange={handleInputChange}
            className="input"
          />

          {settings.eventDate && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-400 mb-2">Countdown to Event</h3>
              <div className="py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700">
                {countdown || 'Enter an event date to start the countdown'}
              </div>
            </div>
          )}

          <label className="block text-gray-400 text-sm mb-2">Greeting Text</label>
          <textarea
            name="greetingText"
            value={settings.greetingText || ''}
            onChange={handleInputChange}
            className="input"
            placeholder="Enter a greeting text for your guests"
            rows="3"
          />
        </div>

        <div className="bg-card p-8 shadow-lg max-w-3xl mx-auto">
          <h2 className="heading-lg text-gray-200">Additional Album Settings</h2>
          <div className="space-y-4">
            <Checkbox label="Allow Image Uploads" name="GuestUploadsImage" isChecked={settings.GuestUploadsImage} onChange={handleInputChange} isFirst={true} />
            <Checkbox label="Allow Video Uploads" name="GuestUploadsVideo" isChecked={settings.GuestUploadsVideo} onChange={handleInputChange} />
            <Checkbox label="Enable Comments" name="Guestcomments" isChecked={settings.Guestcomments} onChange={handleInputChange} />
            <Checkbox label="Enable Download Options" name="GuestDownloadOption" isChecked={settings.GuestDownloadOption} onChange={handleInputChange} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={saveSettings}
            disabled={!isModified}
            className={`px-6 py-2 rounded-lg ${
              isModified
                ? 'bg-orange-600 hover:bg-green-600 text-white'
                : 'bg-gray-400 text-gray-700 cursor-not-allowed'
            }`}
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </Layout>
  );
};

const Checkbox = React.memo(({ label, name, isChecked, onChange, isFirst }) => (
  <div className={`flex items-center justify-between py-2 ${isFirst ? 'pt-4' : ''}`}>
    <span className={`text-gray-300 ${isFirst ? 'font-bold' : ''}`}>{label}</span>
    <input
      type="checkbox"
      name={name}
      checked={isChecked}
      onChange={onChange}
      className="form-checkbox h-6 w-6 text-blue-500"
    />
  </div>
));

export default React.memo(SettingsPage);
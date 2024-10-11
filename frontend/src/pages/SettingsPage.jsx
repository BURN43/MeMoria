import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { debounce } from 'lodash';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000';

const SettingsPage = () => {
  const { user } = useAuthStore();

  const [settings, setSettings] = useState(() => {
    const cachedSettings = localStorage.getItem('albumSettings');
    return cachedSettings ? JSON.parse(cachedSettings) : {
      albumTitle: '',
      eventDate: '',
      eventTime: '',
      greetingText: '',
      guestInfo: '',
      GuestUploadsImage: false,
      GuestUploadsVideo: false,
      Guestcomments: false,
      GuestDownloadOption: false,
    };
  });

  const [countdown, setCountdown] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchSettings = useCallback(async () => {
    const cachedTimestamp = localStorage.getItem('albumSettingsTimestamp');
    const currentTime = new Date().getTime();

    if (cachedTimestamp && currentTime - parseInt(cachedTimestamp) < 3600000) {
      return; // Use cached settings if they're less than an hour old
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings`, {
        withCredentials: true,
      });
      const settingsData = response.data;
      setSettings({
        ...settingsData,
        eventDate: settingsData.eventDate
          ? new Date(settingsData.eventDate).toISOString().split('T')[0]
          : '',
      });

      // Cache the fetched settings
      localStorage.setItem('albumSettings', JSON.stringify(settingsData));
      localStorage.setItem('albumSettingsTimestamp', currentTime.toString());
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const debouncedSaveSettings = useMemo(() => debounce(async (settings) => {
    try {
      await axios.put(`${API_BASE_URL}/api/settings`, settings, {
        withCredentials: true,
      });
      localStorage.setItem('albumSettings', JSON.stringify(settings));
      localStorage.setItem('albumSettingsTimestamp', new Date().getTime().toString());
      setFeedbackMessage('Settings saved successfully!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      setFeedbackMessage('Error saving settings, please try again.');
      console.error('Error:', error);
    }
  }, 500), []);

  useEffect(() => {
    debouncedSaveSettings(settings);
  }, [settings, debouncedSaveSettings]);

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
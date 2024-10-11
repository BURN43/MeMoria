import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const userId = user ? user._id : null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace={true} />;
  }

  // State variables
  const [albumTitle, setAlbumTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [guestInfo, setGuestInfo] = useState('');
  const [GuestUploadsImage, setGuestUploadsImage] = useState(false);
  const [GuestUploadsVideo, setGuestUploadsVideo] = useState(false);
  const [Guestcomments, setGuestcomments] = useState(false);
  const [GuestDownloadOption, setGuestDownloadOption] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/settings`, {
          withCredentials: true,
        });
        const settingsData = response.data;
        setAlbumTitle(settingsData.albumTitle || '');
        setEventDate(
          settingsData.eventDate
            ? new Date(settingsData.eventDate).toISOString().split('T')[0]
            : ''
        );
        setEventTime(settingsData.eventTime || '');
        setGreetingText(settingsData.greetingText || '');
        setGuestInfo(settingsData.guestInfo || '');
        setGuestUploadsImage(settingsData.GuestUploadsImage || false);
        setGuestUploadsVideo(settingsData.GuestUploadsVideo || false);
        setGuestcomments(settingsData.Guestcomments || false);
        setGuestDownloadOption(settingsData.GuestDownloadOption || false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Save settings
  const handleSaveSettings = async () => {
    const settings = {
      albumTitle,
      eventDate,
      eventTime,
      greetingText,
      guestInfo,
      GuestUploadsImage,
      GuestUploadsVideo,
      Guestcomments,
      GuestDownloadOption,
    };

    try {
      await axios.put(`${API_BASE_URL}/api/settings`, settings, {
        withCredentials: true,
      });
      setFeedbackMessage('Settings saved successfully!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      setFeedbackMessage('Error saving settings, please try again.');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (eventDate) {
      const interval = setInterval(() => {
        const eventDateTime = eventTime ? `${eventDate}T${eventTime}` : eventDate;
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
  }, [eventDate, eventTime]);

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
            value={albumTitle || ''}
            onChange={(e) => setAlbumTitle(e.target.value)}
            className="input"
            placeholder="Enter album title"
          />

          <label className="block text-gray-400 text-sm mb-2">Event Date</label>
          <input
            type="date"
            value={eventDate || ''}
            onChange={(e) => setEventDate(e.target.value)}
            className="input"
          />

          <label className="block text-gray-400 text-sm mb-2">Event Time (optional)</label>
          <input
            type="time"
            value={eventTime || ''}
            onChange={(e) => setEventTime(e.target.value)}
            className="input"
          />

          {eventDate && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-400 mb-2">Countdown to Event</h3>
              <div className="py-3 px-4 bg-gray-800 text-white rounded-lg border border-gray-700">
                {countdown || 'Enter an event date to start the countdown'}
              </div>
            </div>
          )}

          <label className="block text-gray-400 text-sm mb-2">Greeting Text</label>
          <textarea
            value={greetingText || ''}
            onChange={(e) => setGreetingText(e.target.value)}
            className="input"
            placeholder="Enter a greeting text for your guests"
            rows="3"
          />
        </div>

        <div className="bg-card p-8 shadow-lg max-w-3xl mx-auto">
          <h2 className="heading-lg text-gray-200">Additional Album Settings</h2>
          <div className="space-y-4">
            <Checkbox label="Allow Image Uploads" isChecked={GuestUploadsImage} onChange={() => setGuestUploadsImage(!GuestUploadsImage)} isFirst={true} />
            <Checkbox label="Allow Video Uploads" isChecked={GuestUploadsVideo} onChange={() => setGuestUploadsVideo(!GuestUploadsVideo)} />
            <Checkbox label="Enable Comments" isChecked={Guestcomments} onChange={() => setGuestcomments(!Guestcomments)} />
            <Checkbox label="Enable Download Options" isChecked={GuestDownloadOption} onChange={() => setGuestDownloadOption(!GuestDownloadOption)} />
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleSaveSettings}
            className="button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </Layout>
  );
};

const Checkbox = ({ label, isChecked, onChange, isFirst }) => (
  <div className={`flex items-center justify-between py-2 ${isFirst ? 'pt-4' : ''}`}>
    <span className={`text-gray-300 ${isFirst ? 'font-bold' : ''}`}>{label}</span>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="form-checkbox h-6 w-6 text-blue-500"
    />
  </div>
);

export default SettingsPage;
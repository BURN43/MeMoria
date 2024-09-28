import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const SettingsPage = () => {
  const { user } = useAuthStore(); // Fetch user from authStore
  const userId = user ? user._id : null; // Get userId from the user object

  // Check if the user is not an admin
  if (!user || user.role !== 'admin') {
    return <Redirect to="/unauthorized" />; // Redirect to an unauthorized page
  }

  useEffect(() => {
    
  }, [userId]);

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
      if (userId) {
        const response = await axios.post(`http://localhost:5000/api/settings/${userId}`, settings);
        console.log('Response data:', response.data);
      } else {
        console.error('UserId is not available');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:5000/api/settings/${userId}`);
          const settingsData = response.data;

          setAlbumTitle(settingsData.albumTitle);

          // Format the eventDate to "yyyy-MM-dd" for the input field
          if (settingsData.eventDate) {
            const formattedDate = new Date(settingsData.eventDate).toISOString().split('T')[0]; // Only keep the date part
            setEventDate(formattedDate);
          }

          setEventTime(settingsData.eventTime); // You may need to format this similarly if needed
          setGreetingText(settingsData.greetingText);
          setGuestInfo(settingsData.guestInfo);
          setGuestUploadsImage(settingsData.GuestUploadsImage);
          setGuestUploadsVideo(settingsData.GuestUploadsVideo);
          setGuestcomments(settingsData.Guestcomments);
          setGuestDownloadOption(settingsData.GuestDownloadOption);
        }
      } catch (error) {
        console.error(error);
      }
    };

    

    fetchSettings();
  }, [userId]);

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
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <h1 className="text-4xl font-extrabold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            Album Settings
          </h1>
          <p className="text-lg text-gray-300">
            Customize your album settings and manage the details for your event.
          </p>
        </div>

        {/* Combined Form Block */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl text-gray-200 font-bold mb-6">Event and Album Details</h2>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Title</label>
            <input
              type="text"
              style={{ textTransform: 'uppercase' }}
              value={albumTitle || ''}
              onChange={(e) => setAlbumTitle(e.target.value)}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 " 
              placeholder="Enter album title"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Event Date</label>
            <input
              type="date"
              value={eventDate || ''}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Event Time (optional)</label>
            <input
              type="time"
              value={eventTime || ''}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Countdown Section */}
          {eventDate && (
            <div className="mb-6">
              <h3 className="text-lg text-gray-400 mb-2">Countdown to Event</h3>
              <div className="py-3 px-4 bg-gray-700 text-white rounded-lg">
                {countdown || 'Enter an event date to start the countdown'}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Greeting Text</label>
            <textarea
              value={greetingText || ''}
              onChange={(e) => setGreetingText(e.target.value)}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a greeting text for your guests"
              rows="3"
            />
          </div>
        </div>

        {/* Settings Checkboxes */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
          <h2 className="text-2xl text-gray-200 font-bold mb-6">Additional Album Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erlaube den Hochladen von Bildern</span>
              <input
                type="checkbox"
                checked={GuestUploadsImage}
                onChange={() => setGuestUploadsImage(!GuestUploadsImage)}
                className="form-checkbox h-6 w-6 text-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erlaube das Hochladen von Videos</span>
              <input
                type="checkbox"
                checked={GuestUploadsVideo}
                onChange={() => setGuestUploadsVideo(!GuestUploadsVideo)}
                className="form-checkbox h-6 w-6 text-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erlaube die Kommentar Funktion</span>
              <input
                type="checkbox"
                checked={Guestcomments}
                onChange={() => setGuestcomments(!Guestcomments)}
                className="form-checkbox h-6 w-6 text-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Erlaube den Download von Videos & Bildern</span>
              <input
                type="checkbox"
                checked={GuestDownloadOption}
                onChange={() => setGuestDownloadOption(!GuestDownloadOption)}
                className="form-checkbox h-6 w-6 text-blue-500"
              />
            </div>
            
          </div>
        </div>

        {/* Save Button */}
        <div className="text-center mt-8">
          <button
            onClick={handleSaveSettings}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default SettingsPage;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';

const spinnerStyles = {
  border: '4px solid rgba(255, 255, 255, 0.3)',
  borderLeftColor: '#ffffff',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
};

const MediaGrid = ({ media = [], handleFileUpload, openModal, loading, isAdmin, userId, albumId }) => {
  const [guestUploads, setGuestUploads] = useState({ image: false, video: false });
  const fileInputRef = useRef(null);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (userId && albumId) {
          const response = await axios.get(`http://localhost:5000/api/settings/${userId}`);
          const settingsData = response.data;
          setGuestUploads({
            image: settingsData.GuestUploadsImage,
            video: settingsData.GuestUploadsVideo,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, [userId, albumId]);

  // Render media (Images/Videos)
  const renderMedia = (mediaItem) => {
    const baseURL = 'http://localhost:5000';
    const fullURL = mediaItem.mediaUrl.startsWith('/uploads/') ? `${baseURL}${mediaItem.mediaUrl}` : mediaItem.mediaUrl;
    const isVideo = fullURL.endsWith('.mp4') || fullURL.endsWith('.webm') || fullURL.endsWith('.avi');

    return (
      <motion.div
        key={mediaItem._id || mediaItem.id || mediaItem.mediaUrl}  // Ensure key is unique and stable
        className="relative w-full cursor-pointer aspect-square bg-gray-800 rounded-lg overflow-hidden"
        onClick={() => openModal(mediaItem)}
      >
        {isVideo ? (
          <video className="w-full h-full object-cover" controls>
            <source src={fullURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            loading="lazy"
            src={fullURL}
            alt={mediaItem.title || 'Media'}
            className="w-full h-full object-cover object-center"
          />
        )}
      </motion.div>
    );
  };

  // Handle file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-1 md:grid-cols-6 h-fit">
      {/* Media Upload Section for Images and Videos */}
      {(isAdmin || guestUploads.image || guestUploads.video) && (
        <div
          className="relative flex flex-col items-center justify-center w-full max-w-xs cursor-pointer aspect-square bg-purple-200 rounded-lg border-2 border-dashed border-purple-600 p-4"
          onClick={handleUploadClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" // Hide the input
            accept="image/*,video/*" // Accept images and videos
          />
          {loading && <div style={spinnerStyles} className="spinner" />}
          <FaPlus className="text-purple-600 text-4xl" />
          <div className="w-full mt-2 text-lg text-purple-600 text-center">Upload Media</div>
        </div>
      )}

      {/* Render Media Items */}
      {media.length > 0 ? (
        media.map((mediaItem) => renderMedia(mediaItem))
      ) : (
        <p className="col-span-3 md:col-span-6 text-center text-gray-500">No media available</p>
      )}
    </div>
  );
};

export default MediaGrid;

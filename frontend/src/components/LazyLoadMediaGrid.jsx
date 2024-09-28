import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const LazyLoadMediaGrid = ({ media, handleFileUpload, openModal, loading, loadMoreMedia, isAdmin, albumId, userId }) => {
  const [itemsToShow, setItemsToShow] = useState(12); // Initial media items to load
  const [isFetching, setIsFetching] = useState(false);
  const [guestUploads, setGuestUploads] = useState({ image: false, video: false });
  const fileInputRef = useRef(null); // Ref for file input

  // Fetch guest upload settings from backend
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

  // Scroll to load more media
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
      return;
    }
    setIsFetching(true);
  }, [isFetching]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    loadMoreMedia(itemsToShow);
    setItemsToShow((prev) => prev + 12); // Load more items per scroll
    setIsFetching(false);
  }, [isFetching, itemsToShow, loadMoreMedia]);

  const renderMedia = (mediaItem) => {
    const baseURL = 'http://localhost:5000';
    const fullURL = mediaItem.mediaUrl.startsWith('/uploads/') ? `${baseURL}${mediaItem.mediaUrl}` : mediaItem.mediaUrl;
    const isVideo = fullURL.endsWith('.mp4') || fullURL.endsWith('.webm') || fullURL.endsWith('.avi');

    return (
      <motion.div
        key={mediaItem._id || mediaItem.id}
        className="relative w-full cursor-pointer aspect-square bg-gray-800 rounded-lg"
        onClick={() => openModal(mediaItem)}
      >
        {isVideo ? (
          <video className="w-32 h-32 object-cover" controls>
            <source src={fullURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            loading="lazy"
            src={fullURL}
            alt={mediaItem.title || 'Media'}
            className="w-full h-full rounded-lg object-cover object-center"
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
          <div className="mt-2 text-lg text-purple-600 text-center">Upload Media</div>
        </div>
      )}

      {/* Render visible media items */}
      {media.slice(0, itemsToShow).map((mediaItem) => renderMedia(mediaItem))}

      {/* Loading more media spinner */}
      {isFetching && (
        <div className="flex justify-center items-center col-span-full">
          <div style={spinnerStyles} className="spinner" />
        </div>
      )}
    </div>
  );
};

export default LazyLoadMediaGrid;

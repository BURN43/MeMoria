import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import ProfilePicture from '../components/ProfilePicture';
import MediaGrid from '../components/MediaGrid';
import MediaModal from '../components/MediaModal';

const AlbumPage = ({ isGuest }) => {
  const { user } = useAuthStore();
  const userId = user ? user._id : null;
  const isAdmin = user && user.role === 'admin';
  const albumId = user ? user.albumId : null;

  const [title, setTitle] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [GuestUploadsImage, setGuestUploadsImage] = useState(false);
  const [GuestUploadsVideo, setGuestUploadsVideo] = useState(false);
  




  // Fetch album settings, profile picture, and media on page load
  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        if (userId && albumId) {
          const settingsResponse = await axios.get(`http://localhost:5000/api/settings/${userId}`, {
            withCredentials: true,
          });
          const settingsData = settingsResponse.data;
          setTitle(settingsData.albumTitle || '');
          setGreetingText(settingsData.greetingText || '');
          setGuestUploadsImage(settingsData.GuestUploadsImage || false);
          setGuestUploadsVideo(settingsData.GuestUploadsVideo || false);

          const profilePicResponse = await axios.get(`http://localhost:5000/api/user/profile/${userId}`, {
            withCredentials: true,
          });

          if (profilePicResponse.data.profilePicUrl) {
            setProfilePic(profilePicResponse.data.profilePicUrl);
          } else {
            setProfilePic(null); // or a default profile picture
          }

          const mediaResponse = await axios.get(`http://localhost:5000/api/album-media/${albumId}/${userId}`, {
            withCredentials: true,
          });
          setMedia(mediaResponse.data.media);
        }
      } catch (error) {
        console.error('Error fetching album data:', error);
        setErrorMessage('Failed to load album data.');
      }
    };

    fetchAlbumData();
  }, [userId, albumId]);

  // Handle profile picture upload
  const handleProfilePicUpload = async (event) => {
    if (event.target.files.length === 0) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', userId);

    try {
      const response = await axios.post('http://localhost:5000/api/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setProfilePic(response.data.profilePicUrl); // Update profile picture
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setErrorMessage('Failed to upload profile picture.');
    }
  };

  // Handle media upload
  const handleMediaUpload = async (file) => {
    const tempId = `temp-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const tempMedia = { id: tempId, mediaUrl: previewUrl, title: 'Uploading...' };
    setMedia([tempMedia, ...media]);
  
    const formData = new FormData();
    formData.append('mediaFile', file);
    formData.append('albumId', albumId);  // Ensure albumId is sent from the frontend
    formData.append('userId', userId);    // Send userId as well
  
    setLoading(true);
  
    try {
      const response = await axios.post('http://localhost:5000/api/album-media/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
  
      const newMedia = {
        id: response.data._id,
        mediaUrl: response.data.mediaUrl,
        title: file.name,
      };
  
      setMedia((prevMedia) => prevMedia.map((item) => (item.id === tempId ? newMedia : item)));
    } catch (error) {
      console.error('Error uploading media:', error);
      setMedia((prevMedia) => prevMedia.filter((item) => item.id !== tempId));
      setErrorMessage('Failed to upload media.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-8 pb-20"
      >
        <div className="text-center max-w-2xl mx-auto mb-8 mt-10">
          <ProfilePicture profilePic={profilePic} isAdmin={isAdmin} handleProfilePicUpload={handleProfilePicUpload} />
          <h1 className="text-4xl font-extrabold mb-2 text-gradient bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text uppercase">
            {title}
          </h1>
          <p className="text-lg text-purple-400">{greetingText}</p>
        </div>

        {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

        <MediaGrid
          media={media}
          handleFileUpload={handleMediaUpload}
          openModal={openModal}
          loading={loading}
          guestUploadsImage={GuestUploadsImage}
          guestUploadsVideo={GuestUploadsVideo}
          isAdmin={isAdmin}
          userId={userId}
          albumId={albumId}
        />
      </motion.div>

      {isModalOpen && selectedMedia && <MediaModal selectedMedia={selectedMedia} closeModal={closeModal} />}
    </Layout>
  );
};

export default AlbumPage;

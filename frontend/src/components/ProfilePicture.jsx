import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import io from 'socket.io-client';

// API URL setup
const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD;


// Inline Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ProfilePicture = ({ isAdmin, userId }) => {
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePicUrl'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const fetchProfilePicture = useCallback(async () => {
    const cachedUrl = localStorage.getItem('profilePicUrl');
    const cachedTimestamp = localStorage.getItem('profilePicTimestamp');
    const now = Date.now();

    if (cachedUrl && cachedTimestamp && now - parseInt(cachedTimestamp) < 3600000) {
      setProfilePic(cachedUrl);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile-picture/profile`, {
        withCredentials: true
      });
      setProfilePic(response.data.profilePicUrl);
      localStorage.setItem('profilePicUrl', response.data.profilePicUrl);
      localStorage.setItem('profilePicTimestamp', now.toString());
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setError('Failed to load profile picture');
    }
  }, []);

  useEffect(() => {
    fetchProfilePicture();
  }, [fetchProfilePicture]);

  useEffect(() => {
    if (socket) {
      socket.on('profile_picture_updated', (data) => {
        if (data.userId === userId) {
          setProfilePic(data.profilePicUrl);
          localStorage.setItem('profilePicUrl', data.profilePicUrl);
          localStorage.setItem('profilePicTimestamp', Date.now().toString());
        }
      });

      return () => {
        socket.off('profile_picture_updated');
      };
    }
  }, [socket, userId]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile-picture/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setProfilePic(response.data.profilePicUrl);
      localStorage.setItem('profilePicUrl', response.data.profilePicUrl);
      localStorage.setItem('profilePicTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="relative w-40 h-40 mx-auto mb-6">
      {loading ? (
        <div className="w-40 h-40 flex items-center justify-center">
          <Spinner />
        </div>
      ) : profilePic ? (
        <div className="relative">
          <img
            src={profilePic}
            className="w-40 h-40 rounded-full object-cover object-center border-4 border-light shadow-lg"
            alt="Profile"
          />
          {isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent bg-opacity-75 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-primary text-sm">Change Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          {isAdmin ? (
            <label className="relative flex flex-col items-center justify-center w-full cursor-pointer aspect-square bg-accent rounded-full border-2 border-dashed border-primary">
              <input
                type="file"
                accept="image/*"
                className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
              />
              <FaPlus className="text-3xl text-primary" />
              <div className="mt-1 text-xs text-primary">Add Profile Picture</div>
            </label>
          ) : (
            <img
              src="/default-profile.png"
              className="w-40 h-40 rounded-full object-cover object-center border-4 border-light shadow-lg"
              alt="Default Profile"
            />
          )}
        </div>
      )}
      {error && <div className="text-error text-sm mt-2">{error}</div>}
    </div>
  );
};

export default ProfilePicture;
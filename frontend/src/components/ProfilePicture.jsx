import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';

// Inline Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ProfilePicture = ({ isAdmin, userId }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfilePicture();
  }, [userId]);

  const fetchProfilePicture = async () => {
    try {
      const response = await axios.get('/api/profile-picture/profile', {
        withCredentials: true
      });
      setProfilePic(response.data.profilePicUrl);
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setError('Failed to load profile picture');
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await axios.post('/api/profile-picture/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      setProfilePic(response.data.profilePicUrl);
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
            className="w-40 h-40 rounded-full object-cover object-center border-4 border-white shadow-lg"
            alt="Profile"
          />
          {isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-200 bg-opacity-75 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-purple-600 text-sm">Profilbild ändern</span>
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
            <label className="relative flex flex-col items-center justify-center w-full cursor-pointer aspect-square bg-purple-200 rounded-full border-2 border-dashed border-purple-600">
              <input
                type="file"
                accept="image/*"
                className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
                onChange={handleUpload}
              />
              <FaPlus className="text-3xl text-purple-600" />
              <div className="mt-1 text-xs text-purple-600">Profilbild hinzufügen</div>
            </label>
          ) : (
            <img
              src="/default-profile.png"
              className="w-40 h-40 rounded-full object-cover object-center border-4 border-white shadow-lg"
              alt="Default Profile"
            />
          )}
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default ProfilePicture;
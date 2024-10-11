import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { FaPlus } from 'react-icons/fa';
import { debounce } from 'lodash';

const API_URL = import.meta.env.MODE === 'development'
  ? 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000/api'
  : '/api';

// Lazy load components
const MediaGrid = lazy(() => import('../components/MediaGrid'));
const MediaModal = lazy(() => import('../components/MediaModal'));

// Inline Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

// Optimized ProfilePicture component with local storage caching
const ProfilePicture = React.memo(({ isAdmin, userId, guestAlbumToken }) => {
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('profilePicUrl'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfilePicture = useCallback(async () => {
    const cachedUrl = localStorage.getItem('profilePicUrl');
    const cachedTimestamp = localStorage.getItem('profilePicTimestamp');
    const now = Date.now();

    if (cachedUrl && cachedTimestamp && now - parseInt(cachedTimestamp) < 3600000) {
      setProfilePic(cachedUrl);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/profile-picture/profile`, {
        params: guestAlbumToken ? { token: guestAlbumToken } : {},
        withCredentials: true
      });
      setProfilePic(response.data.profilePicUrl);
      localStorage.setItem('profilePicUrl', response.data.profilePicUrl);
      localStorage.setItem('profilePicTimestamp', now.toString());
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setError('Failed to load profile picture');
    }
  }, [guestAlbumToken]);

  useEffect(() => {
    fetchProfilePicture();
  }, [fetchProfilePicture]);

  const handleUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const response = await axios.post(`${API_URL}/profile-picture/profile`, formData, {
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
  }, []);

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
              <span className="text-purple-600 text-sm">Change Profile Picture</span>
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
              <div className="mt-1 text-xs text-purple-600">Add Profile Picture</div>
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
});

const AlbumPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const guestAlbumToken = useMemo(() => new URLSearchParams(location.search).get('token'), [location.search]);

  const [albumData, setAlbumData] = useState(() => {
    const cachedData = localStorage.getItem('albumData');
    return cachedData ? JSON.parse(cachedData) : {
      title: '',
      greetingText: '',
      media: [],
      guestUploadsImage: false,
      guestUploadsVideo: false,
    };
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const canUpload = useMemo(() => {
    if (isAuthenticated && user?.role === 'admin') return true;
    if (guestAlbumToken && (albumData.guestUploadsImage || albumData.guestUploadsVideo)) return true;
    return false;
  }, [isAuthenticated, user, guestAlbumToken, albumData.guestUploadsImage, albumData.guestUploadsVideo]);

  const fetchAlbumIdFromToken = useCallback(async (token) => {
    if (!token) return null;
    try {
      const cachedId = localStorage.getItem('albumId');
      if (cachedId) return cachedId;

      const response = await axios.get(`${API_URL}/user/album-id`, {
        params: { token },
        withCredentials: false,
      });
      const albumId = response.data.albumId;
      localStorage.setItem('albumId', albumId);
      return albumId;
    } catch (error) {
      console.error('Error fetching album ID:', error);
      setErrorMessage('Invalid or expired token.');
      return null;
    }
  }, []);

  const fetchAlbumData = useCallback(async () => {
    if (!isAuthenticated && !guestAlbumToken) return;

    try {
      setLoadingSettings(true);
      let currentAlbumId, queryParam, headers;

      if (isAuthenticated && user) {
        currentAlbumId = user.albumId;
        headers = { Authorization: `Bearer ${user.token}` };
      } else if (guestAlbumToken) {
        currentAlbumId = await fetchAlbumIdFromToken(guestAlbumToken);
        queryParam = `?token=${guestAlbumToken}`;
      } else {
        throw new Error('No valid authentication method available');
      }

      if (!currentAlbumId) {
        throw new Error('Unable to determine album ID');
      }

      const cachedData = localStorage.getItem('albumData');
      const cachedTimestamp = localStorage.getItem('albumDataTimestamp');
      const now = Date.now();

      if (cachedData && cachedTimestamp && now - parseInt(cachedTimestamp) < 300000) {
        setAlbumData(JSON.parse(cachedData));
        setLoadingSettings(false);
        return;
      }

      const [mediaResponse, settingsResponse] = await Promise.all([
        axios.get(`${API_URL}/album-media/media/${currentAlbumId}${queryParam || ''}`, {
          headers,
          withCredentials: true,
        }),
        axios.get(`${API_URL}/settings${queryParam || ''}`, {
          headers,
          withCredentials: true,
        })
      ]);

      const sortedMedia = (mediaResponse.data.media || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const settingsData = settingsResponse.data;

      const newAlbumData = {
        title: settingsData.albumTitle || 'Album',
        greetingText: settingsData.greetingText || 'Welcome to the album!',
        media: sortedMedia,
        guestUploadsImage: settingsData.GuestUploadsImage || false,
        guestUploadsVideo: settingsData.GuestUploadsVideo || false,
      };

      setAlbumData(newAlbumData);
      localStorage.setItem('albumData', JSON.stringify(newAlbumData));
      localStorage.setItem('albumDataTimestamp', now.toString());
    } catch (error) {
      console.error('Failed to load album data:', error);
      setErrorMessage('Failed to load album data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingSettings(false);
    }
  }, [isAuthenticated, guestAlbumToken, user, fetchAlbumIdFromToken]);

  useEffect(() => {
    if (!isAuthenticated && !guestAlbumToken) {
      setRedirectToLogin(true);
    } else {
      fetchAlbumData();
    }
  }, [isAuthenticated, guestAlbumToken, fetchAlbumData]);

  const handleMediaUpload = useCallback(async (file) => {
    if (!canUpload) {
      setErrorMessage('Media upload is Deactivated');
      return;
    }

    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('mediaFile', file);
    setLoading(true);

    try {
      let url = `${API_URL}/album-media/upload-media`;
      let headers = {};
      let params = {};

      if (isAuthenticated && user) {
        headers = { Authorization: `Bearer ${user.token}` };
        if (user.role === 'admin') {
          params.albumId = user.albumId;
        }
      } else if (guestAlbumToken) {
        params.token = guestAlbumToken;
      } else {
        throw new Error('No valid authentication method available for upload');
      }

      const response = await axios.post(url, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
        params: params,
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const newMedia = {
        _id: response.data._id,
        mediaUrl: response.data.mediaUrl,
        title: file.name,
        createdAt: new Date().toISOString(),
      };
      setAlbumData(prevData => ({
        ...prevData,
        media: [newMedia, ...prevData.media]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage('Failed to upload media. ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [canUpload, isUploading, isAuthenticated, user, guestAlbumToken]);

  const handleDelete = useCallback(async (mediaId) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      console.error('Unauthorized delete attempt');
      return;
    }

    try {
      await axios.delete(`${API_URL}/album-media/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });
      setAlbumData(prevData => ({
        ...prevData,
        media: prevData.media.filter(item => item._id !== mediaId)
      }));
      console.log('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
      setErrorMessage('Failed to delete media. Please try again.');
    }
  }, [isAuthenticated, user]);

  const openModal = useCallback((mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  }, []);

  const loadMoreMedia = useCallback(debounce(async () => {
    try {
      setLoading(true);
      const lastMediaId = albumData.media[albumData.media.length - 1]._id;
      let url = `${API_URL}/album-media/load-more`;
      let headers = {};
      let params = { 
        albumId: user?.albumId || await fetchAlbumIdFromToken(guestAlbumToken), 
        lastMediaId 
      };

      if (isAuthenticated) {
        headers = { Authorization: `Bearer ${user.token}` };
      } else if (guestAlbumToken) {
        params.token = guestAlbumToken;
      }

      const response = await axios.get(url, { params, headers });
      const newMedia = response.data.media;
      setAlbumData(prevData => {
        const updatedData = {
          ...prevData,
          media: [...prevData.media, ...newMedia].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
        localStorage.setItem('albumData', JSON.stringify(updatedData));
        return updatedData;
      });
    } catch (error) {
      console.error('Failed to load more media:', error);
    } finally {
      setLoading(false);
    }
  }, 300), [albumData.media, user, isAuthenticated, guestAlbumToken, fetchAlbumIdFromToken]);

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
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
          <ProfilePicture 
            isAdmin={isAuthenticated && user?.role === 'admin'} 
            userId={user?._id}
            guestAlbumToken={guestAlbumToken}
          />
          <h1 className="text-4xl font-extrabold mb-2 text-gradient uppercase">
            {albumData.title}
          </h1>
          <p className="text-lg text-purple-400">{albumData.greetingText}</p>
        </div>

        {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {!loadingSettings && (
          <Suspense fallback={<Spinner />}>
            <MediaGrid
              media={albumData.media}
              handleFileUpload={handleMediaUpload}
              openModal={openModal}
              loading={loading || isUploading}
              canUpload={canUpload}
              infiniteScroll={true}
              loadMoreMedia={loadMoreMedia}
              isAdmin={isAuthenticated && user?.role === 'admin'}
              onDelete={handleDelete}
            />
          </Suspense>
        )}
      </motion.div>

      {isModalOpen && selectedMedia && (
        <Suspense fallback={<Spinner />}>
          <MediaModal
            selectedMedia={selectedMedia}
            closeModal={closeModal}
            media={albumData.media}
            comments={{}}
            setComments={() => {}}
            guestSession={guestAlbumToken}
          />
        </Suspense>
      )}
    </Layout>
  );
};

export default React.memo(AlbumPage);
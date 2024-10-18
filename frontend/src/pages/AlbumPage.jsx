import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import { useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { FaPlus } from 'react-icons/fa';
import { debounce } from 'lodash';
import io from 'socket.io-client';

// API URL setup
const API_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV
  : import.meta.env.VITE_API_URL_BASE_WITH_API_PROD;
console.log("API URL:", API_URL);

// Lazy load components
const MediaGrid = lazy(() => import('../components/MediaGrid'));
const MediaModal = lazy(() => import('../components/MediaModal'));

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
  </div>
);

// UploadPopup component
const UploadPopup = ({ onSubmit, onClose }) => {
  const [username, setUsername] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const handleSubmit = () => {
    if (username.trim()) {
      onSubmit(username, greetingText);
      onClose();
    } else {
      alert("Username cannot be empty.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Upload Details</h2>
        <input
          type="text"
          placeholder="Your username"
          className="input mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <textarea
          placeholder="Share a greeting (optional)"
          className="input mb-5 h-24 resize-none"
          value={greetingText}
          onChange={(e) => setGreetingText(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            className="button button-primary mr-2" 
            onClick={handleSubmit}
          >
            Upload
          </button>
          <button 
            className="button button-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
  };

// ProfilePicture component
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
        withCredentials: true,
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
        withCredentials: true,
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
            className="w-40 h-40 rounded-full object-cover object-center border-4 border-light shadow-lg"
            alt="Profile"
          />
          {isAdmin && (
            <div className="absolute inset-0 flex items-center justify-center bg-accent bg-opacity-75 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-100">
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
            <label className="relative flex flex-col items-center justify-center w-full cursor-pointer aspect-square bg-accent rounded-full border-2 border-dashed border-accent">
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
  const [socket, setSocket] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const canUpload = useMemo(() => {
    if (isAuthenticated && user?.role === 'admin') return true;
    if (guestAlbumToken && (albumData.guestUploadsImage || albumData.guestUploadsVideo)) return true;
    return false;
  }, [isAuthenticated, user, guestAlbumToken, albumData.guestUploadsImage, albumData.guestUploadsVideo]);

  useEffect(() => {
    const socketUrl = import.meta.env.MODE === 'development'
      ? import.meta.env.VITE_API_URL
      : import.meta.env.VITE_API_BASE_URL_PROD;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(newSocket);

    const handleReconnect = () => {
      console.log('WebSocket reconnected');
      fetchAlbumData(true);
    };

    newSocket.on('connect', handleReconnect);
    newSocket.on('settings_updated', handleSettingsUpdate);
    newSocket.on('settings_deleted', handleSettingsDelete);
    newSocket.on('media_uploaded', handleMediaUploaded);
    newSocket.on('media_deleted', handleMediaDeleted);

    return () => {
      newSocket.off('connect', handleReconnect);
      newSocket.off('settings_updated', handleSettingsUpdate);
      newSocket.off('settings_deleted', handleSettingsDelete);
      newSocket.off('media_uploaded', handleMediaUploaded);
      newSocket.off('media_deleted', handleMediaDeleted);
      newSocket.close();
    };
  }, []);

  const handleSettingsUpdate = useCallback((updatedSettings) => {
    setAlbumData(prevData => {
      const newData = {
        ...prevData,
        title: updatedSettings.albumTitle || 'Album',
        greetingText: updatedSettings.greetingText || 'Welcome to the album!',
        guestUploadsImage: updatedSettings.GuestUploadsImage || false,
        guestUploadsVideo: updatedSettings.GuestUploadsVideo || false,
      };
      localStorage.setItem('albumData', JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleSettingsDelete = useCallback(() => {
    setAlbumData(prevData => {
      const newData = {
        ...prevData,
        title: 'Album',
        greetingText: 'Welcome to the album!',
        guestUploadsImage: false,
        guestUploadsVideo: false,
      };
      localStorage.removeItem('albumData');
      return newData;
    });
  }, []);

  const handleMediaUploaded = useCallback((newMedia) => {
    setAlbumData(prevData => ({
      ...prevData,
      media: [newMedia, ...prevData.media].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    }));
  }, []);

  const handleMediaDeleted = useCallback((deletedMediaId) => {
    setAlbumData(prevData => ({
      ...prevData,
      media: prevData.media.filter(item => item._id !== deletedMediaId)
    }));
  }, []);

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

  const fetchAlbumData = useCallback(async (force = false) => {
    if (!isAuthenticated && !guestAlbumToken) return;

    const now = Date.now();
    const lastFetchTime = localStorage.getItem('lastAlbumDataFetchTime');

    if (!force && lastFetchTime && now - parseInt(lastFetchTime) < 5 * 60 * 1000) {
      const cachedData = localStorage.getItem('albumData');
      if (cachedData) {
        setAlbumData(JSON.parse(cachedData));
        setLoadingSettings(false);
        return;
      }
    }

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
      const sortedMedia = (mediaResponse.data.media || [])
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .map(item => ({
          ...item,
          challengeTitle: item.challengeTitle || '',
          uploaderUsername: item.uploaderUsername || ''
        }));
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
      localStorage.setItem('lastAlbumDataFetchTime', now.toString());
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
      fetchAlbumData(true);
    }
  }, [isAuthenticated, guestAlbumToken, fetchAlbumData]);

  const handleMediaUpload = useCallback(async (file) => {
    if (!canUpload) {
      setErrorMessage('Media upload is Deactivated');
      return;
    }

    if (isUploading) return;
    setPendingFile(file);
    setIsPopupVisible(true);
  }, [canUpload, isUploading]);

  const onUploadSubmit = async (username, greetingText) => {
    setIsUploading(true);
    setUploadProgress(0);

    const optimisticMedia = {
      _id: 'temp_' + Date.now(),
      mediaUrl: URL.createObjectURL(pendingFile),
      title: pendingFile.name,
      uploadedAt: new Date().toISOString(),
      challengeTitle: '',
      uploaderUsername: username
    };

    setAlbumData(prevData => ({
      ...prevData,
      media: [optimisticMedia, ...prevData.media]
    }));

    const formData = new FormData();
    formData.append('mediaFile', pendingFile);
    formData.append('uploaderUsername', username);
    formData.append('greetingText', greetingText);

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
        title: pendingFile.name,
        uploadedAt: new Date().toISOString(),
        challengeTitle: response.data.challengeTitle || '',
        uploaderUsername: username,
        greetingText: greetingText
      };

      setAlbumData(prevData => ({
        ...prevData,
        media: prevData.media.map(item => 
          item._id === optimisticMedia._id ? newMedia : item
        ).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      }));

      if (socket && socket.connected) {
        socket.emit('media_uploaded', newMedia);
      }

      setIsPopupVisible(false);
      setPendingFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrorMessage('Failed to upload media. ' + (error.response?.data?.error || error.message));

      setAlbumData(prevData => ({
        ...prevData,
        media: prevData.media.filter(item => item._id !== optimisticMedia._id)
      }));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = useCallback(async (mediaId) => {
    if (!isAuthenticated || user?.role !== 'admin') {
      console.error('Unauthorized delete attempt');
      return;
    }

    setAlbumData(prevData => ({
      ...prevData,
      media: prevData.media.filter(item => item._id !== mediaId)
    }));

    try {
      await axios.delete(`${API_URL}/album-media/media/${mediaId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        withCredentials: true,
      });

      if (socket && socket.connected) {
        socket.emit('media_deleted', mediaId);
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setErrorMessage('Failed to delete media. Please try again.');
      fetchAlbumData(true);
    }
  }, [isAuthenticated, user, socket, fetchAlbumData]);

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
        lastMediaId,
      };

      if (isAuthenticated) {
        headers = { Authorization: `Bearer ${user.token}` };
      } else if (guestAlbumToken) {
        params.token = guestAlbumToken;
      }
      const response = await axios.get(url, { params, headers });
      const newMedia = response.data.media.map(item => ({
        ...item,
        challengeTitle: item.challengeTitle || '',
        uploaderUsername: item.uploaderUsername || ''
      }));
      setAlbumData(prevData => {
        const updatedData = {
          ...prevData,
          media: [...prevData.media, ...newMedia].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
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
        <div className="text-center max-w-2xl mx-auto mb-8 mt-4">
          <ProfilePicture
            isAdmin={isAuthenticated && user?.role === 'admin'}
            userId={user?._id}
            guestAlbumToken={guestAlbumToken}
          />
          <h1 className="text-4xl font-bold mb-2 text-gradient uppercase">
            {albumData.title}
          </h1>
          <p className="text-lg text-accent">{albumData.greetingText}</p>
        </div>
        {errorMessage && <div className="text-error text-center mb-4">{errorMessage}</div>}
        {isUploading && (
          <div className="w-full mb-4">
            <progress 
              className="progress-primary"
              value={uploadProgress}
              max="100"
            ></progress>
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
              showChallengeTitle={true}
              showUploaderUsername={true}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
            showChallengeTitle={true}
            showUploaderUsername={true}
          />
        </Suspense>
      )}
      {isPopupVisible && (
        <UploadPopup
          onSubmit={onUploadSubmit}
          onClose={() => setIsPopupVisible(false)}
        />
      )}
    </Layout>
  );
  };

export default React.memo(AlbumPage);

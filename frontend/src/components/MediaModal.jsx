import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaRegHeart, FaRegComment, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import CommentPanel from './CommentPanel';

const API_URL = 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000/api';

const UsernameModal = React.memo(({ onSubmit, onCancel }) => {
  const [username, setUsername] = useState('');

  return (
    <div className="absolute bg-white p-4 rounded shadow-lg z-50">
      <h2 className="text-lg font-bold mb-2">Please Enter Your Username</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={() => onSubmit(username)} className="bg-blue-500 text-white p-2 rounded mr-2">Submit</button>
      <button onClick={onCancel} className="bg-red-500 text-white p-2 rounded">Cancel</button>
    </div>
  );
});

const MediaContent = React.memo(({ mediaType, mediaUrl, title }) => {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    if (mediaType === 'image') {
      const img = new Image();
      img.onload = () => {
        setIsPortrait(img.height > img.width);
      };
      img.src = mediaUrl;
    }
  }, [mediaType, mediaUrl]);

  return mediaType === 'video' ? (
    <video className="w-full h-full object-contain" controls autoPlay>
      <source src={mediaUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={mediaUrl}
        alt={title || 'Media'}
        className={`max-w-full max-h-full ${isPortrait ? 'h-full' : 'w-full'} object-contain`}
      />
    </div>
  );
});

const MediaModal = ({
  selectedMedia,
  closeModal,
  media,
  comments,
  setComments,
  guestSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  // Reverse the order of media for display in the modal
  const reversedMedia = useMemo(() => [...media].reverse(), [media]);

  useEffect(() => {
    if (selectedMedia && reversedMedia.length > 0) {
      const initialIndex = reversedMedia.findIndex((item) => item._id === selectedMedia._id);
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);

      // Scroll to the selected media item
      const scrollContainer = document.getElementById('media-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = initialIndex * window.innerHeight;
      }
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedMedia, reversedMedia]);

  const toggleLike = useCallback(async (mediaId, username) => {
    if (!username.trim()) {
      alert('Username cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/like/${mediaId}`, { guestSession: username });
      // Update the likes count in the media array
      const updatedMedia = reversedMedia.map(item => 
        item._id === mediaId ? { ...item, likes: response.data.likes } : item
      );
      // You need to have a function to update the media array in the parent component
      // updateMedia(updatedMedia.reverse());
      setShowUsernameModal(false);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to toggle like, please try again.');
    }
    setLoading(false);
  }, [reversedMedia]);

  const handleCommentSubmit = useCallback(async (mediaId, comment, setNewComment) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/comments/${mediaId}`, { comment, guestSession });
      setComments((prev) => ({
        ...prev,
        [mediaId]: [...(prev[mediaId] || []), response.data.comment],
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment, please try again.');
    }
    setLoading(false);
  }, [guestSession, setComments]);

  const handleScroll = useCallback((e) => {
    const index = Math.round(e.target.scrollTop / window.innerHeight);
    if (index !== currentIndex && index >= 0 && index < reversedMedia.length) {
      setCurrentIndex(index);
    }
  }, [currentIndex, reversedMedia.length]);

  const currentMedia = useMemo(() => reversedMedia[currentIndex], [reversedMedia, currentIndex]);
  const commentCount = useMemo(() => currentMedia ? comments[currentMedia._id]?.length || 0 : 0, [comments, currentMedia]);

  if (!reversedMedia || reversedMedia.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <div 
        id="media-scroll-container"
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
        onScroll={handleScroll}
      >
        {reversedMedia.map((item, index) => (
          <div key={item._id} className="w-screen h-screen snap-always snap-center">
            <div className="relative w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden">
              <MediaContent
                mediaType={item.mediaType}
                mediaUrl={item.mediaUrl}
                title={item.title}
              />

              <button onClick={closeModal} className="absolute top-4 left-4 p-2 text-white text-2xl z-10">
                <FaChevronLeft />
              </button>

              <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-4 text-white">
                <button onClick={() => setShowUsernameModal(true)} disabled={loading}>
                  <FaRegHeart className={item.likes?.length > 0 ? 'text-red-500' : 'text-white'} size={28} />
                  <span className="block text-center mt-1">{item.likes?.length || 0}</span>
                </button>
                <button onClick={() => setShowCommentPanel(prev => !prev)} disabled={loading}>
                  <FaRegComment className="text-white" size={28} />
                  <span className="block text-center mt-1">{comments[item._id]?.length || 0}</span>
                </button>
                <button>
                  <FiSend className="text-white" size={28} />
                </button>
              </div>

              <div className="absolute bottom-0 w-full text-center text-white bg-gradient-to-t from-black to-transparent py-4">
                <p>von <span className="font-semibold">{item.author || 'Unknown'}</span></p>
                <p className="text-sm">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showUsernameModal && currentMedia && (
        <UsernameModal
          onSubmit={(username) => toggleLike(currentMedia._id, username)}
          onCancel={() => setShowUsernameModal(false)}
        />
      )}

      {currentMedia && (
        <CommentPanel
          selectedMedia={currentMedia}
          comments={comments}
          setComments={setComments}
          guestSession={guestSession}
          showCommentPanel={showCommentPanel}
          handleCommentSubmit={handleCommentSubmit}
          closeCommentPanel={() => setShowCommentPanel(false)}
        />
      )}
    </div>
  );
};

export default React.memo(MediaModal);
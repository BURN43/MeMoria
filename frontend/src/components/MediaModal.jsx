import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaRegHeart, FaRegComment, FaChevronLeft } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import CommentPanel from './CommentPanel';

const UsernameModal = ({ onSubmit, onCancel }) => {
  const [username, setUsername] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="border p-2 mb-2 w-full"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(username)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const MediaContent = React.memo(({ mediaType, mediaUrl, title }) => {
  return mediaType === 'video' ? (
    <video
      className="max-w-full max-h-full object-contain"
      controls
      autoPlay
      playsInline
      muted
    >
      <source src={mediaUrl} type="video/mp4" />
      Ihr Browser unterstützt das Video-Tag nicht.
    </video>
  ) : (
    <img
      src={mediaUrl}
      alt={title || 'Medieninhalt'}
      className="max-w-full max-h-full object-contain"
    />
  );
});

const MediaModal = ({
  selectedMedia,
  closeModal,
  media,
  comments,
  setComments,
  guestSession,
  showChallengeTitle,
  showUploaderUsername,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const reversedMedia = useMemo(() => [...media].reverse(), [media]);

  useEffect(() => {
    if (selectedMedia && reversedMedia.length > 0) {
      const initialIndex = reversedMedia.findIndex(
        (item) => item._id === selectedMedia._id
      );
      setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);

      const scrollContainer = document.getElementById('media-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTop =
          initialIndex * scrollContainer.clientHeight;
      }
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedMedia, reversedMedia]);

  const toggleLike = useCallback(
    async (mediaId, username) => {
      if (!username.trim()) {
        alert('Der Benutzername darf nicht leer sein.');
        return;
      }
      setLoading(true);
      try {
        const response = await axios.post(`/api/media/${mediaId}/like`, {
          username,
        });
        const updatedMedia = response.data;
        setCurrentIndex((prevIndex) => {
          const newMedia = [...reversedMedia];
          newMedia[prevIndex] = updatedMedia;
          return prevIndex;
        });
      } catch (error) {
        console.error('Error toggling like:', error);
      } finally {
        setLoading(false);
        setShowUsernameModal(false);
      }
    },
    [reversedMedia]
  );

  const handleScroll = useCallback(
    (e) => {
      const containerHeight = e.target.clientHeight;
      const index = Math.round(e.target.scrollTop / containerHeight);
      if (
        index !== currentIndex &&
        index >= 0 &&
        index < reversedMedia.length
      ) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, reversedMedia.length]
  );

  const currentMedia = useMemo(
    () => reversedMedia[currentIndex],
    [reversedMedia, currentIndex]
  );

  const commentCount = useMemo(
    () => (currentMedia ? comments[currentMedia._id]?.length || 0 : 0),
    [comments, currentMedia]
  );

  const handleCommentSubmit = useCallback(
    async (comment) => {
      if (!currentMedia) return;

      try {
        const response = await axios.post(
          `/api/media/${currentMedia._id}/comment`,
          comment
        );
        const newComment = response.data;
        setComments((prevComments) => ({
          ...prevComments,
          [currentMedia._id]: [
            ...(prevComments[currentMedia._id] || []),
            newComment,
          ],
        }));
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    },
    [currentMedia, setComments]
  );

  if (!reversedMedia || reversedMedia.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <div
        id="media-scroll-container"
        className="w-screen h-screen overflow-y-scroll snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{ 
          height: '100%', 
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        {reversedMedia.map((item, index) => (
          <div
            key={item._id}
            className="w-screen h-screen snap-always snap-center flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <MediaContent
                mediaType={item.mediaType}
                mediaUrl={item.mediaUrl}
                title={item.title}
              />
              {/* Like- and Comment Icons */}
              <div className="absolute bottom-20 right-4 sm:right-10 flex flex-col items-center space-y-4 text-white  py-20">
                <button
                  onClick={() => setShowUsernameModal(true)}
                  disabled={loading}
                  className="p-2"
                >
                  <FaRegHeart
                    className={
                      item.likes?.length > 0 ? 'text-red-500' : 'text-white'
                    }
                    size={24}
                  />
                  <span className="block text-center mt-1 text-sm">
                    {item.likes?.length || 0}
                  </span>
                </button>
                <button
                  onClick={() => setShowCommentPanel((prev) => !prev)}
                  disabled={loading}
                  className="p-2"
                >
                  <FaRegComment className="text-white" size={24} />
                  <span className="block text-center mt-1 text-sm">
                    {comments[item._id]?.length || 0}
                  </span>
                </button>
                <button className="p-2">
                  <FiSend className="text-white" size={24} />
                </button>
              </div>
              {/* Bottom Text */}
              <div className="absolute bottom-0 left-0 right-0 text-center text-white bg-gradient-to-t from-black to-transparent py-20 px-20">
                {showChallengeTitle && item.challengeTitle && (
                  <p className="font-semibold mb-1 text-sm sm:text-base">
                    Challenge: {item.challengeTitle}
                  </p>
                )}
                {showUploaderUsername && item.uploaderUsername && (
                  <p className="mb-2 text-white text-sm sm:text-base">
                    Hochgeladen von: {item.uploaderUsername}
                  </p>
                )}
                {item.greetingText && (
                  <p className="italic mb-2 text-white text-sm sm:text-base">
                    "{item.greetingText}"
                  </p>
                )}
              </div>
              {/* Back Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 left-4 p-2 text-white text-2xl z-10"
                style={{
                  top: 'max(env(safe-area-inset-top), 1rem) ',
                  left: 'max(env(safe-area-inset-left), 1rem)',
                }}
              >
                <FaChevronLeft />
              </button>
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
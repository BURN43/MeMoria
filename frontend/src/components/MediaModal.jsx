import React, { useState, useEffect } from 'react';
import { FaHeart, FaComment, FaDownload, FaEllipsisH, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';

const MediaModal = ({
  selectedMedia,
  closeModal,
  handleLikeToggle,
  toggleComments,
  likes,
  comments,
  showComments,
  setComments,
  isAdmin,
     // Correct naming from schema
          // Correct naming from schema
  guestSession
  
}) => {

  
  const [Guestcomments, setGuestcomments] = useState(false);


  useEffect(() => {
    console.log("Modal Props:");
    console.log("guestComments:", guestComments);
    console.log("guestDownloadOption:", guestDownloadOption);
    console.log("selectedMedia:", selectedMedia);
    console.log("isAdmin:", isAdmin);
  }, [guestComments, guestDownloadOption, selectedMedia, isAdmin]);

  const [newComment, setNewComment] = useState('');
  const smileys = ['😊', '😍', '😂', '😎', '👍']; // Preset smileys
  const [likeCount, setLikeCount] = useState(selectedMedia.likes.length);
  

  // Handle like toggle with backend
  const handleLikeClick = async (mediaId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/like/${mediaId}`, {
        userId: isAdmin ? user._id : null,
        guestSession: !isAdmin ? guestSession : null,
      });
      setLikeCount(response.data.likeCount); // Update like count with response from server
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const response = await axios.post(`http://localhost:5000/api/comments/${selectedMedia._id}`, {
          comment: newComment,
          userId: isAdmin ? user._id : null,
          guestSession: !isAdmin ? guestSession : null,
        });
        setComments((prev) => ({
          ...prev,
          [selectedMedia._id]: [...(comments[selectedMedia._id] || []), response.data.comment],
        }));
        setNewComment('');
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  useEffect(() => {
    // Disable body scroll when the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Re-enable scroll when the modal is closed
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-lg">
      <div className="relative w-full max-w-4xl p-4 bg-transparent rounded-lg flex flex-col items-center">
        
        {/* Back Arrow */}
        <button onClick={closeModal} className="absolute top-2 left-2 p-2 bg-black rounded-full text-white">
          <FaArrowLeft />
        </button>

        {/* Fullscreen Media Display */}
        <div className="w-full max-w-full sm:max-w-3xl md:max-w-2xl lg:max-w-xl xl:max-w-4xl h-auto max-h-[70vh] overflow-hidden">
          {selectedMedia.mediaUrl.endsWith('.mp4') ? (
            <video className="w-full h-auto max-h-[70vh] object-cover" controls autoPlay>
              <source src={selectedMedia.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={selectedMedia.mediaUrl}
              alt={selectedMedia.title}
              className="w-full h-auto max-h-[70vh] object-cover"
            />
          )}
        </div>

        {/* Interaction Buttons */}
        <div className="absolute right-4 top-[50%] transform -translate-y-[50%] flex flex-col space-y-4 items-center">
          {/* Like Button */}
          <button onClick={() => handleLikeClick(selectedMedia._id)}>
            <FaHeart className={likeCount > 0 ? 'text-red-500' : 'text-gray-300'} size={24} />
            <span className="text-white">{likeCount}</span>
          </button>

          {/* Comment Button: Only show if Guestcomments is true */}
          {guestComments && (
            <button onClick={toggleComments}>
              <FaComment className="text-gray-300" size={24} />
              <span className="text-white">{comments[selectedMedia._id] ? comments[selectedMedia._id].length : 0}</span>
            </button>
          )}

          {/* Download Button: Only show if GuestDownloadOption is true */}
          {guestDownloadOption && (
            <a href={selectedMedia.mediaUrl} download>
              <FaDownload className="text-gray-300" size={24} />
            </a>
          )}

          {/* Admin Options */}
          {isAdmin && (
            <button>
              <FaEllipsisH className="text-gray-300" size={24} />
            </button>
          )}
        </div>

        {/* Uploader Information and Greeting Message */}
        <div className="mt-4 px-4 text-white text-center sm:text-left">
          <p className="text-white">
            von <strong>{selectedMedia.uploader || 'Veranstalter'}</strong>
          </p>
          {selectedMedia.greeting && <p className="text-gray-400">{selectedMedia.greeting}</p>}
          <p className="text-gray-400">{new Date(selectedMedia.uploadDate).toLocaleDateString()}</p>
        </div>

        {/* Post Caption */}
        <div className="mt-2 px-4 text-white text-center sm:text-left">
          <p>{selectedMedia.caption ? selectedMedia.caption : "No Caption"}</p>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="absolute bottom-0 w-full h-auto bg-black bg-opacity-70 backdrop-blur-md p-4 max-h-[50%] overflow-auto">
            <div className="text-sm text-gray-300">Comments:</div>
            <ul className="list-disc list-inside text-gray-300">
              {(comments[selectedMedia._id] || []).map((comment, idx) => (
                <li key={idx} className="flex items-center">
                  {comment} <FaHeart className="ml-2 text-gray-300" size={12} />
                </li>
              ))}
            </ul>

            {/* Comment Input with Smileys */}
            <div className="flex items-center mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="border p-2 w-full bg-gray-800 text-white placeholder-gray-400"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleCommentSubmit} className="ml-2 text-blue-500">
                Enter
              </button>
            </div>

            {/* Smileys Preset */}
            <div className="flex space-x-2 mt-2">
              {smileys.map((smiley) => (
                <span
                  key={smiley}
                  className="cursor-pointer text-xl text-white"
                  onClick={() => setNewComment((prev) => prev + smiley)}
                >
                  {smiley}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Close Interaction */}
        <button onClick={closeModal} className="absolute top-4 right-4 text-white text-2xl">
          X
        </button>
      </div>
    </div>
  );
};

export default MediaModal;

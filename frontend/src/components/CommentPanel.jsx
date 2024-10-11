import React, { useState, useEffect } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';

const CommentPanel = ({
  selectedMedia,
  comments,
  setComments,
  isAdmin,
  guestSession,
  showCommentPanel,
  handleCommentSubmit,
  closeCommentPanel
}) => {
  const [newComment, setNewComment] = useState('');

  const [{ y }, api] = useSpring(() => ({ y: window.innerHeight }));

  useEffect(() => {
    if (showCommentPanel) {
      api.start({ y: 0 });
    } else {
      api.start({ y: window.innerHeight });
    }
  }, [showCommentPanel, api]);

  const bind = useGesture({
    onDrag: ({ down, movement: [, my], direction: [, dy], cancel }) => {
      if (down && Math.abs(my) > 100) cancel();
      if (!down) {
        if (dy > 0) closeCommentPanel();
        else api.start({ y: 0 });
      } else {
        api.start({ y: my });
      }
    },
  });

  const onCommentSubmit = async () => {
    if (newComment.trim()) {
      await handleCommentSubmit(selectedMedia._id, newComment, isAdmin, guestSession, setComments, setNewComment);
    }
  };

  if (!selectedMedia) {
    return null;
  }

  return (
    <animated.div
      {...bind()}
      style={{ y }}
      className="fixed bottom-0 left-0 w-full bg-gray-800 rounded-t-lg overflow-y-auto max-h-3/4 md:max-h-full"
    >
      <div className="flex items-center p-4 cursor-pointer" onClick={closeCommentPanel}>
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto"></div>
      </div>
      <div className="flex-1 text-gray-200 p-4 pb-4">
        <p className="mb-4">{selectedMedia.caption || "No Caption"}</p>
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Comments:</div>
          <ul className="space-y-2">
            {comments[selectedMedia._id] && comments[selectedMedia._id].map((comment, idx) => (
              <li key={idx} className="flex items-center">
                <div className="mr-2">User:</div>
                <div>{comment}</div>
                <FaRegHeart className="ml-2 text-gray-400" size={12} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Add a comment..."
            className="border p-2 w-full rounded bg-gray-700 text-white placeholder-gray-400"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={onCommentSubmit} className="ml-2 text-blue-500">
            Enter
          </button>
        </div>
      </div>
    </animated.div>
  );
};

export default CommentPanel;
import React, { useState } from 'react';

const UsernamePopup = ({ onSubmit, onClose }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    if (username.trim()) {
      onSubmit(username);
      onClose();
    } else {
      alert("Username cannot be empty.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-card p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Enter Username</h2>
        <input
          type="text"
          placeholder="Your username"
          className="input mb-5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex justify-end">
          <button 
            className="button button-primary mr-2" 
            onClick={handleSubmit}
          >
            Submit
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

export default UsernamePopup;

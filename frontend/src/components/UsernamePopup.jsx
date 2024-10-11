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
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Enter Username</h2>
        <input
          type="text"
          placeholder="Your username"
          className="border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full mb-5 bg-gray-100 text-gray-800 placeholder-gray-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="flex justify-end">
          <button className="bg-purple-600 text-white py-2 px-4 rounded-lg mr-2 hover:bg-purple-700 transition-colors" onClick={handleSubmit}>
            Submit
          </button>
          <button className="py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsernamePopup;
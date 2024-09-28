// src/components/ProfileDropdown.jsx
import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleForgotPassword = async () => {
    await logout();
    navigate('/forgot-password');
  };

  return (
    <div className="relative">
       {/* Profil-Icon */}
       <div
        onClick={toggleDropdown}
        className="cursor-pointer text-3xl text-purple-400 hover:text-purple-400 transition-colors duration-300"
      >
        <FaUserCircle className="hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Dropdown-Menü */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 hover:text-purple-400 transition-colors duration-300"
          >
            Logout
          </button>
          <button
            onClick={handleForgotPassword}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 hover:text-purple-400 transition-colors duration-300"
          >
            Forgot Password
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user && user.role === 'admin';

  // Define paths where ProfileDropdown should not appear
  const restrictedPaths = ['/login', '/signup', '/forgot-password', '/verify-email'];

  // Check if the current path is restricted
  const isRestricted = restrictedPaths.includes(location.pathname);

  // Do not render the component if the user is not an admin or the path is restricted
  if (!isAdmin || isRestricted) {
    return null;
  }

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleForgotPassword = async () => {
    await logout();
    navigate('/forgot-password'); // Navigate directly to the forgot-password page
  };

  return (
    <div className="relative z-50">
      <div
        onClick={toggleDropdown}
        className="cursor-pointer text-3xl text-purple-400 hover:text-purple-400 transition-colors duration-300"
      >
        <FaUserCircle className="hover:scale-110 transition-transform duration-300" />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 z-50">
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
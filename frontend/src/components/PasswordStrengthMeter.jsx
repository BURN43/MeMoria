// src/components/ProfileDropdown.jsx
import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';  // Verwende den Auth Store

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();  // Verwende die bereits funktionierende Logout-Funktion
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    logout();  // Logout-Funktion aus dem Auth Store
    navigate('/login');  // Benutzer zur Login-Seite weiterleiten
  };

  const handleChangePassword = () => {
    navigate('/change-password');  // Weiterleitung zur Passwort ändern-Seite
  };

  return (
    <div className="relative">
      {/* Profil-Icon */}
      <div
        onClick={toggleDropdown}
        className="cursor-pointer text-3xl text-white hover:text-purple-400 transition-colors duration-300"
      >
        <FaUserCircle className="hover:scale-110 transition-transform duration-300" />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
          <button
            onClick={handleLogout}  // Nutze die bestehende Logout-Funktion
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 hover:text-purple-400 transition-colors duration-300"
          >
            Logout
          </button>
          <button
            onClick={handleChangePassword}  // Weiterleitung zur Seite "Passwort ändern"
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 hover:text-purple-400 transition-colors duration-300"
          >
            Change Password
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

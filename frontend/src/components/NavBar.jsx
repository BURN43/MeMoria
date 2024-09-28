// src/components/NavBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';  // Verwende NavLink statt Link, um den aktiven Zustand zu unterstützen
import { FaHome, FaCog, FaCamera, FaShareAlt, FaArrowUp, FaImages, FaQrcode } from 'react-icons/fa';  // FaImages für Album-Icon

export const NavBar = () => (
  <nav className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-3 z-50 shadow-lg">
    <div className="flex justify-around items-center">
      <NavItem to="/" icon={<FaHome />} label="Home" />
      <NavItem to="/settings" icon={<FaCog />} label="Settings" />
      <NavItem to="/album" icon={<FaImages />} label="Album" />  
      <NavItem to="/photo-challenge" icon={<FaCamera />} label="Challenges" />
      <NavItem to="/guest-challange" icon={<FaCamera />} label="Challenges Guest" />
      <NavItem to="/design-table-stand" icon={<FaQrcode />} label="Design Stand" />
      <NavItem to="/expand-package" icon={<FaArrowUp />} label="Upgrade" />
    </div>
  </nav>
);

// NavItem Component for individual items
const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center text-center p-2 rounded-lg transition-colors duration-300 ${
        isActive ? 'text-purple-400 bg-gray-800' : 'text-gray-400 hover:text-white'
      }`
    }
  >
    <span className="text-2xl mb-1">{icon}</span>  {/* Icon size increased slightly */}
    <span className="text-xs">{label}</span>       {/* Smaller label text */}
  </NavLink>
);

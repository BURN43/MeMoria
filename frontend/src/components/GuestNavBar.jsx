import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaImages, FaCamera } from 'react-icons/fa';

const GuestNavBar = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const albumToken = query.get('token');

  // Only render this NavBar if the albumToken exists
  if (!albumToken) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-900 text-white py-3 z-50 shadow-lg">
      <div className="flex justify-around items-center">
        {/* Access the album page with the token */}
        <NavItem to={`/album?token=${albumToken}`} icon={<FaImages />} label="Album" />
        {/* Access the guest challenge page with the token */}
        <NavItem to={`/guest-challenge?token=${albumToken}`} icon={<FaCamera />} label="Guest Challenges" />
      </div>
    </nav>
  );
};

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
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-xs">{label}</span>
  </NavLink>
);

export default GuestNavBar;
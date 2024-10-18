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
    <nav className="guest-navbar">
      <div className="flex justify-around items-center">
        <NavItem to={`/album?token=${albumToken}`} icon={<FaImages />} label="Album" />
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
      `flex flex-col items-center flex-1 text-center py-2 transition-transform duration-300 ${
        isActive ? 'text-primary bg-card' : 'text-secondary hover:text-primary'
      } hover:scale-110`
    }
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-xs">{label}</span>
  </NavLink>
);

export default GuestNavBar;
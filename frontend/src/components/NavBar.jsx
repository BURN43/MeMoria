import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCog, FaCamera, FaImages, FaQrcode, FaArrowUp } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore'; // Import the auth store for user state

export const NavBar = () => {
  const { user } = useAuthStore();
  const isAdmin = user && user.role === 'admin';

  if (!isAdmin) {
    return null; // Render nothing if the user is not an admin
  }

  return (
    <nav className="admin-navbar">
      <div className="flex justify-around items-center">
        <NavItem to="/" icon={<FaHome />} label="Home" />
        <NavItem to="/settings" icon={<FaCog />} label="Settings" />
        <NavItem to="/album" icon={<FaImages />} label="Album" />
        <NavItem to="/photo-challenge" icon={<FaCamera />} label="Challenges Admin" />
        <NavItem to="/guest-challenge" icon={<FaCamera />} label="Challenges" />
        <NavItem to="/design-table-stand" icon={<FaQrcode />} label="Design Stand" />
        <NavItem to="/paket-erweitern" icon={<FaArrowUp />} label="Paket erweitern" />
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
        isActive ? 'text-primary bg-card active' : 'text-secondary hover:text-primary'
      } hover:scale-110`
    }
    aria-label={label}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-xs">{label}</span>
  </NavLink>
  );

export default NavBar;

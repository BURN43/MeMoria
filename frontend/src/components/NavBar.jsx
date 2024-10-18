import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCog, FaCamera, FaImages, FaQrcode, FaArrowUp } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

export const NavBar = () => {
  const { user } = useAuthStore();
  const isAdmin = user && user.role === 'admin';
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const scrollThreshold = 200; // Adjust this value as needed
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
          // Scrolling down & past threshold
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsVisible(true);
        }

        // Update last scroll position
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  if (!isAdmin) {
    return null;
  }

  return (
    <nav className={`admin-navbar fixed bottom-0 left-0 w-full bg-card shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex justify-around items-center h-16 overflow-x-auto">
        <NavItem to="/" icon={<FaHome />} label="Home" />
        <NavItem to="/settings" icon={<FaCog />} label="Settings" />
        <NavItem to="/album" icon={<FaImages />} label="Album" />
        <NavItem to="/photo-challenge" icon={<FaCamera />} label="Challenges" />
        <NavItem to="/guest-challenge" icon={<FaCamera />} label="Guest" />
        <NavItem to="/design-table-stand" icon={<FaQrcode />} label="QR" />
        <NavItem to="/paket-erweitern" icon={<FaArrowUp />} label="Upgrade" />
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center px-2 h-full min-w-[60px] ${
        isActive ? 'text-primary bg-card active' : 'text-secondary'
      }`
    }
    aria-label={label}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-[10px] whitespace-nowrap">{label}</span>
  </NavLink>
);

export default NavBar;
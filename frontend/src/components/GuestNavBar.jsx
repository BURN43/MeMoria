import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaImages, FaCamera } from 'react-icons/fa';

const GuestNavBar = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const albumToken = query.get('token');
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

  // Only render this NavBar if the albumToken exists
  if (!albumToken) {
    return null;
  }

  return (
    <nav className={`guest-navbar fixed bottom-0 left-0 w-full bg-card shadow-lg transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="flex justify-around items-center h-16">
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
      `flex flex-col items-center justify-center px-2 h-full min-w-[60px] ${
        isActive ? 'text-primary bg-card' : 'text-secondary hover:text-primary'
      }`
    }
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-xs whitespace-nowrap">{label}</span>
  </NavLink>
);

export default GuestNavBar;
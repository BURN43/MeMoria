// src/components/Layout.jsx
import React from 'react';
import { NavBar } from './NavBar';
import ProfileDropdown from './ProfileDropdown';  // Profil-Dropdown importieren

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      {/* Profil oben rechts */}
      <div className="absolute top-4 right-4">
        <ProfileDropdown />
      </div>

      {/* Hauptinhalt */}
      <div className="pb-20"> {/* padding-bottom to make space for NavBar */}
        {children}
      </div>

      {/* Navigation Bar */}
      <NavBar />
    </div>
  );
};

export default Layout;

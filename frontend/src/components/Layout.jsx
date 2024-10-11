// src/components/Layout.jsx
import React from 'react';
import { NavBar } from './NavBar';
import ProfileDropdown from './ProfileDropdown';

const Layout = ({ children }) => {
  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Profile Dropdown - responsive placement */}
      <div className="absolute top-4 right-4 sm:right-8">
        <ProfileDropdown />
      </div>

      {/* Main content */}
      <div className="flex-grow container mx-auto px-4 sm:px-8 pb-20">
        {children}
      </div>

      {/* Navigation Bar with responsive spacing */}
      <div className="flex-shrink-0">
        <NavBar />
      </div>
    </div>
  );
};

export default Layout;
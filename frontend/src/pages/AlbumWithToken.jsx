// File: src/pages/AlbumWithToken.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import AlbumPage from './AlbumPage'; // Correct import path

const AlbumWithToken = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const albumToken = query.get('token');

  return <AlbumPage albumToken={albumToken} />;
};

export default AlbumWithToken;
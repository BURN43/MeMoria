import { io } from 'socket.io-client';

// Use appropriate URL based on environment
const SOCKET_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_API_BASE_URL_DEV // Development URL
  : import.meta.env.VITE_API_BASE_URL_PROD; // Production URL

// Initialize Socket.IO client with dynamic URL
const socket = io(SOCKET_URL, {
  withCredentials: true,
});

export default socket;

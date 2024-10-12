import { io } from 'socket.io-client';

const socket = io('https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000', {
  withCredentials: true,
});

export default socket;
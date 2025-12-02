import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],    // IMPRESCINDIBLE
      autoConnect: true
    });
  }
  return socket;
};

export const useSocket = (eventName, callback) => {
  useEffect(() => {
    const socket = getSocket();
    
    socket.on(eventName, callback);
    
    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback]);
};

export default useSocket;

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const CollaborationContext = createContext({});

export const useCollaboration = () => useContext(CollaborationContext);

export const CollaborationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const joinRoom = (roomId, roomName) => {
    if (socket && user) {
      const userName = user.user_metadata?.name || user.email.split('@')[0];
      
      console.log('Joining room:', roomId);
      
      socket.emit('join-room', {
        roomId,
        userId: user.id,
        userName
      });
      
      setCurrentRoom({ id: roomId, name: roomName });
      setIsInRoom(true);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom && user) {
      console.log('Leaving room:', currentRoom.id);
      
      socket.emit('leave-room', {
        roomId: currentRoom.id,
        userId: user.id
      });
      
      setCurrentRoom(null);
      setRoomUsers([]);
      setIsInRoom(false);
    }
  };

  const sendCodeChange = (code) => {
    if (socket && currentRoom && user) {
      socket.emit('code-change', {
        roomId: currentRoom.id,
        code,
        userId: user.id
      });
    }
  };

  const sendLanguageChange = (language) => {
    if (socket && currentRoom) {
      socket.emit('language-change', {
        roomId: currentRoom.id,
        language
      });
    }
  };

  const notifyAnalysisStart = (analysisType) => {
    if (socket && currentRoom) {
      socket.emit('analysis-started', {
        roomId: currentRoom.id,
        analysisType
      });
    }
  };

  const value = {
    socket,
    connected,
    currentRoom,
    roomUsers,
    isInRoom,
    joinRoom,
    leaveRoom,
    sendCodeChange,
    sendLanguageChange,
    notifyAnalysisStart,
    setRoomUsers
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

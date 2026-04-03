import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const CollaborationContext = createContext({});

const resolveSocketUrl = () => {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL;

  if (explicitSocketUrl) {
    return explicitSocketUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  return window.location.origin;
};

export const useCollaboration = () => useContext(CollaborationContext);

export const CollaborationProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomUsers, setRoomUsers] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [sharedCode, setSharedCode] = useState('');
  const [sharedLanguage, setSharedLanguage] = useState('javascript');

  const getDisplayName = (activeUser) =>
    activeUser?.name || activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'Guest';

  const upsertRoomUser = (incomingUser) => {
    if (!incomingUser?.socketId) {
      return;
    }
    
    setRoomUsers((previousUsers) => {
      const filteredUsers = previousUsers.filter((userItem) => userItem.socketId !== incomingUser.socketId);
      return [...filteredUsers, incomingUser];
    });
  };

  const emitJoinRoom = (activeSocket, room, activeUser) => {
    if (!activeSocket || !room?.id || !activeUser?.id) {
      return;
    }

    const userName = getDisplayName(activeUser);

    console.log('Joining room:', room.id);
    activeSocket.emit('join-room', {
      roomId: room.id,
      userId: activeUser.id,
      userName
    });
  };

  useEffect(() => {
    if (!user) return;

    const socketUrl = resolveSocketUrl();
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleRoomState = ({ code: roomCode, language: roomLanguage, users }) => {
      setSharedCode(roomCode || '');
      setSharedLanguage(roomLanguage || 'javascript');
      setRoomUsers(users || []);
    };

    const handleUserJoined = (joinedUser) => {
      upsertRoomUser(joinedUser);
    };

    const handleUserLeft = ({ socketId }) => {
      setRoomUsers((previousUsers) => previousUsers.filter((userItem) => userItem.socketId !== socketId));
    };

    const handleCodeUpdate = ({ code: nextCode }) => {
      setSharedCode(nextCode || '');
    };

    const handleLanguageUpdate = ({ language: nextLanguage }) => {
      setSharedLanguage(nextLanguage || 'javascript');
    };

    socket.on('room-state', handleRoomState);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('code-update', handleCodeUpdate);
    socket.on('language-update', handleLanguageUpdate);

    return () => {
      socket.off('room-state', handleRoomState);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('code-update', handleCodeUpdate);
      socket.off('language-update', handleLanguageUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !connected || !currentRoom || !user) {
      return;
    }

    emitJoinRoom(socket, currentRoom, user);
  }, [socket, connected, currentRoom, user]);

  const joinRoom = (roomId, roomName) => {
    if (!roomId) {
      return;
    }

    const room = { id: roomId, name: roomName };
    setCurrentRoom(room);
    setRoomUsers([
      {
        socketId: socket?.id || `local-${user?.id}`,
        userId: user?.id,
        userName: getDisplayName(user),
        color: '#4ECDC4'
      }
    ]);
    setSharedCode('');
    setSharedLanguage('javascript');
    setIsInRoom(true);

    if (socket && connected && user) {
      emitJoinRoom(socket, room, user);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom && user) {
      console.log('Leaving room:', currentRoom.id);

      socket.emit('leave-room', {
        roomId: currentRoom.id,
        userId: user.id
      });
    }

    setCurrentRoom(null);
    setRoomUsers([]);
    setIsInRoom(false);
    setSharedCode('');
    setSharedLanguage('javascript');
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
    sharedCode,
    sharedLanguage,
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

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useCollaboration } from '../context/CollaborationContext';

const CollaborativeEditor = ({ code, setCode, language, setLanguage }) => {
  const { 
    socket, 
    currentRoom,
    sendCodeChange,
    sendLanguageChange,
    setRoomUsers,
  } = useCollaboration();
  
  const [localCode, setLocalCode] = useState(code);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const debounceTimer = useRef(null);

  // Initialize local code
  useEffect(() => {
    setLocalCode(code);
  }, []);

  useEffect(() => {
    if (!socket || !currentRoom) return;

    // Room state received (when joining)
    socket.on('room-state', ({ code: roomCode, language: roomLanguage, users }) => {
      console.log('Received room state:', { roomCode: roomCode?.length, roomLanguage, users: users?.length });
      
      isRemoteChange.current = true;
      
      if (roomCode) {
        setLocalCode(roomCode);
        setCode(roomCode);
      }
      
      if (roomLanguage) {
        setLanguage(roomLanguage);
      }
      
      if (users) {
        setRoomUsers(users);
      }
    });

    // User joined
    socket.on('user-joined', (user) => {
      console.log('User joined:', user.userName);
      setRoomUsers(prev => [...prev, user]);
    });

    // User left
    socket.on('user-left', ({ socketId, userName }) => {
      console.log('User left:', userName);
      setRoomUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    // Code update from others
    socket.on('code-update', ({ code: newCode }) => {
      console.log('Received code update');
      isRemoteChange.current = true;
      setLocalCode(newCode);
      setCode(newCode);
    });

    // Language update
    socket.on('language-update', ({ language: newLanguage }) => {
      console.log('Received language update:', newLanguage);
      setLanguage(newLanguage);
    });

    return () => {
      socket.off('room-state');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
      socket.off('language-update');
    };
  }, [socket, currentRoom]);

  const handleEditorChange = (value) => {
    // If it's a remote change, just update local state
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    
    // Update local state immediately for smooth typing
    setLocalCode(value);
    setCode(value);
    
    // Debounce sending to other users
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      sendCodeChange(value);
    }, 300); // Send after 300ms of no typing
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    sendLanguageChange(newLanguage);
  };

  return (
    <div className="glass-effect rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Collaborative Code Editor</h2>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="px-3 py-2 bg-slate-900/50 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
      </div>

      <Editor
        height="500px"
        language={language}
        value={localCode}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
};

export default CollaborativeEditor;

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useCollaboration } from '../context/CollaborationContext';

const CollaborativeEditor = ({ code, setCode, language, setLanguage }) => {
  const { 
    currentRoom,
    sharedCode,
    sharedLanguage,
    sendCodeChange,
    sendLanguageChange,
  } = useCollaboration();
  
  const [localCode, setLocalCode] = useState(code);
  const editorRef = useRef(null);
  const isRemoteChange = useRef(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    if (!currentRoom) return;

    isRemoteChange.current = true;
    setLocalCode(sharedCode || '');
    setCode(sharedCode || '');
  }, [sharedCode, currentRoom, setCode]);

  useEffect(() => {
    if (!currentRoom || !sharedLanguage) return;

    setLanguage(sharedLanguage);
  }, [sharedLanguage, currentRoom, setLanguage]);

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

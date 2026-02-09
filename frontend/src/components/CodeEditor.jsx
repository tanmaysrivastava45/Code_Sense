import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeEditor = ({ code, setCode, language, setLanguage }) => {
  return (
    <div className="glass-card rounded-xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Paste Your Code</h2>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="typescript">TypeScript</option>
        </select>
      </div>
      
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your code here..."
          className="w-full h-96 p-4 bg-gray-900 text-white font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 border border-white/10"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeEditor;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import { 
  Download, Clock, Database, 
  Lightbulb, FileText, Trash2, X, Menu, Sparkles, AlertTriangle
} from 'lucide-react';
import CollaborationHub from '../components/CollaborationHub';

const Home = () => {
  const { user, token, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [results, setResults] = useState({
    problemName: '',
    timeComplexity: '',
    spaceComplexity: '',
    explanation: '',
    improvements: '',
    syntaxErrors: ''
  });
  const [loading, setLoading] = useState({
    all: false,
    time: false,
    space: false,
    explain: false,
    improve: false,
    syntax: false
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Load history when user is available
    if (user && token) {
      loadHistory();
    }
  }, [user, token, authLoading, isAuthenticated, navigate]);

  const loadHistory = async () => {
    if (!token) {
      console.log('Token not available');
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/analysis/history`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Load history error:', error);
      if (error.response?.status === 401) {
        console.log('Session expired or invalid');
      }
    }
  };

  const handleAnalyzeAll = async () => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (!code.trim()) {
      alert('Please enter some code to analyze');
      return;
    }

    setLoading({ ...loading, all: true });

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/analysis/analyze-all`,
        { code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data.results);
      loadHistory();
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze code. Please try again.');
    } finally {
      setLoading({ ...loading, all: false });
      setSidebarOpen(false);
    }
  };

  const handleIndividualAnalysis = async (type) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (!code.trim()) {
      alert('Please enter some code to analyze');
      return;
    }

    const loadingKey = {
      'timeComplexity': 'time',
      'spaceComplexity': 'space',
      'understanding': 'explain',
      'improvements': 'improve',
      'syntaxErrors': 'syntax'
    }[type];

    setLoading({ ...loading, [loadingKey]: true });

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/analysis/analyze`,
        { code, language, analysisType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(prev => ({
        ...prev,
        [type === 'understanding' ? 'explanation' : type]: response.data.result
      }));

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze code. Please try again.');
    } finally {
      setLoading({ ...loading, [loadingKey]: false });
      setSidebarOpen(false);
    }
  };

  const exportToPDF = () => {
    if (!results.problemName && !results.timeComplexity && !results.spaceComplexity && !results.explanation && !results.improvements) {
      alert('No results to export!');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(results.problemName || 'Code Analysis', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Language: ${language} | Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 15;

    const addSection = (title, content) => {
      if (!content) return;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.text(title, 20, y);
      y += 7;
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content.replace(/[*#]/g, ''), 170);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 10;
    };

    addSection('CODE:', code);
    addSection('SYNTAX ERRORS:', results.syntaxErrors);
    addSection('TIME COMPLEXITY:', results.timeComplexity);
    addSection('SPACE COMPLEXITY:', results.spaceComplexity);
    addSection('EXPLANATION:', results.explanation);
    addSection('IMPROVEMENTS:', results.improvements);

    doc.save(`codesense-${Date.now()}.pdf`);
  };

  const deleteHistoryItem = async (id) => {
    if (!confirm('Delete this analysis?')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.delete(`${API_URL}/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const loadFromHistory = (item) => {
    setCode(item.code);
    setResults({
      problemName: item.problem_name,
      syntaxErrors: item.syntax_errors || '',
      timeComplexity: item.time_complexity || '',
      spaceComplexity: item.space_complexity || '',
      explanation: item.explanation || '',
      improvements: item.improvements || ''
    });
    setLanguage(item.language);
    setShowHistory(false);
  };

  // Show loading state while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const hasResults = results.timeComplexity || results.spaceComplexity || results.explanation || results.improvements || results.syntaxErrors;

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 py-8 flex gap-6">
        {/* Left Sidebar - Analysis Options */}
        <aside className={`${
          sidebarOpen ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'
        } lg:block lg:relative lg:bg-transparent`}>
          <div className={`${
            sidebarOpen ? 'absolute left-0 top-0 bottom-0 w-80' : ''
          } lg:w-64 glass-effect rounded-xl p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto`}>
            {sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-cyan-300 hover:text-white lg:hidden"
              >
                <X size={24} />
              </button>
            )}
            
            <h2 className="text-xl font-bold text-white mb-6">Analyze Code</h2>
            
            <button
              onClick={handleAnalyzeAll}
              disabled={loading.all || !code.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 gradient-primary text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-semibold"
            >
              <Sparkles size={20} />
              <span>{loading.all ? 'Analyzing...' : 'Analyze All'}</span>
            </button>

            <div className="mb-4">
              <p className="text-xs text-gray-400 text-center mb-4">Or analyze individually:</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleIndividualAnalysis('syntaxErrors')}
                disabled={loading.syntax || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle size={20} />
                <span className="text-sm">{loading.syntax ? 'Checking...' : 'Syntax Errors'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('timeComplexity')}
                disabled={loading.time || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock size={20} />
                <span className="text-sm">{loading.time ? 'Analyzing...' : 'Time Complexity'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('spaceComplexity')}
                disabled={loading.space || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database size={20} />
                <span className="text-sm">{loading.space ? 'Analyzing...' : 'Space Complexity'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('understanding')}
                disabled={loading.explain || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                <span className="text-sm">{loading.explain ? 'Analyzing...' : 'Understand Code'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('improvements')}
                disabled={loading.improve || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb size={20} />
                <span className="text-sm">{loading.improve ? 'Analyzing...' : 'Improvements'}</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-cyan-500/30">
              <label className="block text-sm font-semibold text-cyan-300 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/50 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>

            {hasResults && (
              <div className="mt-6 pt-6 border-t border-cyan-500/30">
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <Download size={16} />
                  <span>Export PDF</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Mobile menu button */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-40 p-4 gradient-primary text-white rounded-full shadow-xl"
          >
            <Menu size={24} />
          </button>

          {/* Collaboration Hub - Prominent Feature */}
          <CollaborationHub />

          {/* Code Input */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Enter Your Code</h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 gradient-primary text-white rounded-lg transition-all text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/50"
              >
                {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="w-full h-64 px-4 py-3 bg-slate-900/50 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm resize-none"
            />
          </div>

          {/* Results */}
          {hasResults && (
            <div className="space-y-6">
              {/* Problem Name Header */}
              {results.problemName && (
                <div className="gradient-primary rounded-xl p-6 shadow-xl">
                  <h2 className="text-2xl font-bold text-white">{results.problemName}</h2>
                  <p className="text-cyan-100 text-sm mt-1">Language: {language}</p>
                </div>
              )}

              {/* Syntax Errors */}
              {results.syntaxErrors && (
                <div className="glass-effect rounded-xl p-6 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-red-400" size={24} />
                    <h3 className="text-lg font-bold text-white">Syntax Errors</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.syntaxErrors}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Time Complexity */}
              {results.timeComplexity && (
                <div className="glass-effect rounded-xl p-6 border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-cyan-400" size={24} />
                    <h3 className="text-lg font-bold text-white">Time Complexity</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.timeComplexity}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Space Complexity */}
              {results.spaceComplexity && (
                <div className="glass-effect rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="text-blue-400" size={24} />
                    <h3 className="text-lg font-bold text-white">Space Complexity</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.spaceComplexity}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {results.explanation && (
                <div className="glass-effect rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="text-green-400" size={24} />
                    <h3 className="text-lg font-bold text-white">Code Explanation</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Improvements */}
              {results.improvements && (
                <div className="glass-effect rounded-xl p-6 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="text-amber-400" size={24} />
                    <h3 className="text-lg font-bold text-white">Suggested Improvements</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {results.improvements}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* History Sidebar */}
        {showHistory && (
          <aside className="hidden md:block w-80 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="glass-effect rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Recent Analyses</h3>
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="bg-white/5 rounded-lg p-3 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-cyan-300 text-sm font-semibold line-clamp-1">
                          {item.problem_name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile History Modal */}
      {showHistory && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full bg-slate-900 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">History</h3>
              <button onClick={() => setShowHistory(false)} className="text-cyan-300">
                <X size={24} />
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No history yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="bg-white/5 rounded-lg p-3 border border-cyan-500/20"
                  >
                    <p className="text-cyan-300 text-sm font-semibold">{item.problem_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

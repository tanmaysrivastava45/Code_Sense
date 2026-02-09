import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollaboration } from '../context/CollaborationContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CollaborationBanner from '../components/CollaborationBanner';
import CollaborativeEditor from '../components/CollaborativeEditor';
import { 
  Download, Clock, Database, 
  Lightbulb, FileText, X, Menu, Sparkles, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

const CollaborationRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { joinRoom, leaveRoom, currentRoom, isInRoom, notifyAnalysisStart } = useCollaboration();
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    problemName: '',
    timeComplexity: '',
    spaceComplexity: '',
    explanation: '',
    improvements: '',
    syntaxErrors: ''
  });
  const [analysisLoading, setAnalysisLoading] = useState({
    all: false,
    time: false,
    space: false,
    explain: false,
    improve: false,
    syntax: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !session) {
      navigate('/register');
      return;
    }

    if (!roomId) {
      navigate('/home');
      return;
    }

    // Load room info and join
    loadRoomAndJoin();

    // Cleanup on unmount
    return () => {
      if (isInRoom && currentRoom?.id === roomId) {
        leaveRoom();
      }
    };
  }, [roomId, user, session]);

  const loadRoomAndJoin = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/collaboration/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      const room = response.data.room;
      setRoomInfo(room);
      
      // Join room (will receive current state via socket)
      joinRoom(roomId, room.name);
      
    } catch (error) {
      console.error('Load room error:', error);
      alert('Failed to load room. Redirecting to home...');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/home');
  };

  const handleAnalyzeAll = async () => {
    if (!code.trim()) {
      alert('Please enter some code to analyze');
      return;
    }

    setAnalysisLoading({ ...analysisLoading, all: true });
    notifyAnalysisStart('all');

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/analysis/analyze-all`,
        { code, language },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      setResults(response.data.results);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze code.');
    } finally {
      setAnalysisLoading({ ...analysisLoading, all: false });
      setSidebarOpen(false);
    }
  };

  const handleIndividualAnalysis = async (type) => {
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

    setAnalysisLoading({ ...analysisLoading, [loadingKey]: true });
    notifyAnalysisStart(type);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.post(
        `${API_URL}/analysis/analyze`,
        { code, language, analysisType: type },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      setResults(prev => ({
        ...prev,
        [type === 'understanding' ? 'explanation' : type]: response.data.result
      }));

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze code.');
    } finally {
      setAnalysisLoading({ ...analysisLoading, [loadingKey]: false });
      setSidebarOpen(false);
    }
  };

  const exportToPDF = () => {
    if (!results.problemName && !results.timeComplexity) {
      alert('No results to export!');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(results.problemName || 'Code Analysis', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Language: ${language} | Room: ${roomInfo?.name}`, 20, y);
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

    doc.save(`collab-${roomInfo?.name}-${Date.now()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining room...</p>
        </div>
      </div>
    );
  }

  const hasResults = results.timeComplexity || results.spaceComplexity || results.explanation || results.improvements || results.syntaxErrors;

  return (
    <div className="min-h-screen pt-20 pb-8">
      <CollaborationBanner onLeave={handleLeaveRoom} />
      
      <div className="container mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
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
            
            <h2 className="text-xl font-bold text-white mb-6">Analyze Together</h2>
            
            <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-xs text-cyan-300">
                🎯 Everyone in the room will see the analysis!
              </p>
            </div>
            
            <button
              onClick={handleAnalyzeAll}
              disabled={analysisLoading.all || !code.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 gradient-primary text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed mb-6 font-semibold"
            >
              <Sparkles size={20} />
              <span>{analysisLoading.all ? 'Analyzing...' : 'Analyze All'}</span>
            </button>

            <div className="mb-4">
              <p className="text-xs text-gray-400 text-center mb-4">Or analyze individually:</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleIndividualAnalysis('syntaxErrors')}
                disabled={analysisLoading.syntax || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle size={20} />
                <span className="text-sm">{analysisLoading.syntax ? 'Checking...' : 'Syntax Errors'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('timeComplexity')}
                disabled={analysisLoading.time || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock size={20} />
                <span className="text-sm">{analysisLoading.time ? 'Analyzing...' : 'Time Complexity'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('spaceComplexity')}
                disabled={analysisLoading.space || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database size={20} />
                <span className="text-sm">{analysisLoading.space ? 'Analyzing...' : 'Space Complexity'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('understanding')}
                disabled={analysisLoading.explain || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                <span className="text-sm">{analysisLoading.explain ? 'Analyzing...' : 'Understand Code'}</span>
              </button>

              <button
                onClick={() => handleIndividualAnalysis('improvements')}
                disabled={analysisLoading.improve || !code.trim()}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb size={20} />
                <span className="text-sm">{analysisLoading.improve ? 'Analyzing...' : 'Improvements'}</span>
              </button>
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
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed bottom-6 left-6 z-40 p-4 gradient-primary text-white rounded-full shadow-xl"
          >
            <Menu size={24} />
          </button>

          <CollaborativeEditor 
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
          />

          {/* Results */}
          {hasResults && (
            <div className="space-y-6">
              {results.problemName && (
                <div className="gradient-primary rounded-xl p-6 shadow-xl">
                  <h2 className="text-2xl font-bold text-white">{results.problemName}</h2>
                  <p className="text-cyan-100 text-sm mt-1">Language: {language} | Room: {roomInfo?.name}</p>
                </div>
              )}

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
      </div>
    </div>
  );
};

export default CollaborationRoom;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { History as HistoryIcon, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const History = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const normalizeHistoryItem = (item) => ({
    ...item,
    id: item.id || item._id,
    createdAt: item.createdAt || item.created_at,
    problemName: item.problemName || item.problem_name || 'Code Analysis',
    syntaxErrors: item.syntaxErrors || item.syntax_errors || '',
    timeComplexity: item.timeComplexity || item.time_complexity || '',
    spaceComplexity: item.spaceComplexity || item.space_complexity || '',
    explanation: item.explanation || '',
    improvements: item.improvements || '',
    code: item.code || ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!token) return;

    fetchHistory();
    fetchStats();
  }, [user, token, navigate, filter]);

  const fetchHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/analysis/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalizedHistory = (response.data.history || []).map(normalizeHistoryItem);
      setHistory(
        filter === 'all'
          ? normalizedHistory
          : normalizedHistory.filter((item) => {
              if (filter === 'time-complexity') return Boolean(item.timeComplexity);
              if (filter === 'space-complexity') return Boolean(item.spaceComplexity);
              if (filter === 'understand') return Boolean(item.explanation);
              if (filter === 'improvements') return Boolean(item.improvements);
              return true;
            })
      );
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/analysis/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.delete(`${API_URL}/analysis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(history.filter(item => item.id !== id));
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete analysis.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSections = (analysis) => [
    { label: 'Syntax Errors', value: analysis.syntaxErrors },
    { label: 'Time Complexity', value: analysis.timeComplexity },
    { label: 'Space Complexity', value: analysis.spaceComplexity },
    { label: 'Code Understanding', value: analysis.explanation },
    { label: 'Improvements', value: analysis.improvements }
  ].filter((section) => section.value);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <HistoryIcon className="w-10 h-10 text-primary-400" />
            <h1 className="text-4xl font-bold text-white">Analysis History</h1>
          </div>

          {stats && (
            <div className="glass-card rounded-xl p-4 flex items-center space-x-4">
              <TrendingUp className="w-6 h-6 text-primary-400" />
              <div>
                <p className="text-sm text-gray-300">Total Analyses</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            All ({stats?.total || 0})
          </button>
          <button
            onClick={() => setFilter('time-complexity')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'time-complexity' 
                ? 'bg-primary-500 text-white' 
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            Time ({stats?.byType?.['time-complexity'] || 0})
          </button>
          <button
            onClick={() => setFilter('space-complexity')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'space-complexity' 
                ? 'bg-primary-500 text-white' 
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            Space ({stats?.byType?.['space-complexity'] || 0})
          </button>
          <button
            onClick={() => setFilter('understand')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'understand' 
                ? 'bg-primary-500 text-white' 
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            Understanding ({stats?.byType?.['understand'] || 0})
          </button>
          <button
            onClick={() => setFilter('improvements')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'improvements' 
                ? 'bg-primary-500 text-white' 
                : 'glass-card text-gray-300 hover:bg-white/10'
            }`}
          >
            Improvements ({stats?.byType?.['improvements'] || 0})
          </button>
        </div>

        {history.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-xl text-gray-300">
              No analysis history yet. Start analyzing code to build your history!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {history.map(analysis => (
              <div key={analysis.id} className="glass-card rounded-xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <span className="text-sm text-gray-300">
                      {formatDate(analysis.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">{analysis.problemName}</h4>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <SyntaxHighlighter
                        language={analysis.language || 'javascript'}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, maxHeight: '200px' }}
                      >
                        {analysis.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {getSections(analysis).map((section) => (
                    <div key={section.label}>
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">
                        {section.label}
                      </h4>
                      <p className="text-sm text-gray-300 bg-gray-900/50 p-4 rounded-lg whitespace-pre-wrap">
                        {section.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

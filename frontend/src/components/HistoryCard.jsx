import { Trash2, Calendar } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const HistoryCard = ({ analysis, onDelete }) => {
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

  return (
    <div className="glass-card rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-gray-300">{formatDate(analysis.created_at)}</span>
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-medium">
            {analysis.language}
          </span>
        </div>
        <button
          onClick={() => onDelete(analysis.id)}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Code</h4>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language={analysis.language}
              style={vscDarkPlus}
              customStyle={{ margin: 0, maxHeight: '200px' }}
            >
              {analysis.code}
            </SyntaxHighlighter>
          </div>
        </div>

        {analysis.time_complexity && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Time Complexity</h4>
            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">
              {analysis.time_complexity}
            </p>
          </div>
        )}

        {analysis.space_complexity && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Space Complexity</h4>
            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">
              {analysis.space_complexity}
            </p>
          </div>
        )}

        {analysis.code_understanding && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Understanding</h4>
            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">
              {analysis.code_understanding}
            </p>
          </div>
        )}

        {analysis.code_improvements && (
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Improvements</h4>
            <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">
              {analysis.code_improvements}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryCard;

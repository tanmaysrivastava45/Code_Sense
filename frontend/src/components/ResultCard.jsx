import { FileText, Clock, Database, Lightbulb, BookOpen } from 'lucide-react';

const ResultCard = ({ title, content, loading, icon: Icon }) => {
  const getIcon = () => {
    switch(title) {
      case 'Time Complexity':
        return Clock;
      case 'Space Complexity':
        return Database;
      case 'Code Understanding':
        return BookOpen;
      case 'Code Improvements':
        return Lightbulb;
      default:
        return FileText;
    }
  };

  const IconComponent = Icon || getIcon();

  return (
    <div className="glass-card rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-primary-500/20 rounded-lg">
          <IconComponent className="w-6 h-6 text-primary-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      <div className="bg-gray-900/50 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : content ? (
          <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <p className="text-gray-500 italic">Click "Analyze" to see results here</p>
        )}
      </div>
    </div>
  );
};

export default ResultCard;

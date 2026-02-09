import { useState } from 'react';
import { Users, X } from 'lucide-react';
import CollaborationModal from './CollaborationModal';
import { useCollaboration } from '../context/CollaborationContext';

const CollaborationFAB = () => {
  const [showModal, setShowModal] = useState(false);
  const { isInRoom } = useCollaboration();

  if (isInRoom) return null; // Hide FAB when in room

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-40 p-5 gradient-primary text-white rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-110 group"
        title="Start Collaboration"
      >
        <Users size={28} className="animate-pulse-slow" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-950 animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-950"></span>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="glass-effect px-4 py-2 rounded-lg whitespace-nowrap">
            <p className="text-sm font-semibold text-white">Start Collaborating</p>
            <p className="text-xs text-gray-300">Code together in real-time</p>
          </div>
        </div>
      </button>

      <CollaborationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default CollaborationFAB;

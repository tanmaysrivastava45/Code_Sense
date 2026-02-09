import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import CollaborationModal from './CollaborationModal';

const CollaborationHub = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="glass-effect rounded-2xl p-8 mb-8 border-2 border-cyan-500/30 hover:border-cyan-500/50 transition-all">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left Side - Icon & Info */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                <Users size={48} className="text-white" />
              </div>
            </div>
          </div>

          {/* Middle - Description */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-white">Real-Time Collaboration</h2>
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full animate-pulse">
                NEW
              </span>
            </div>
            <p className="text-gray-300 mb-3">
              Code together in real-time with your team, friends, or during interviews. Share a room and see changes instantly!
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-cyan-300 justify-center md:justify-start">
              <span className="flex items-center gap-1">
                <Sparkles size={14} />
                Live Code Sync
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                Multi-User Support
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ArrowRight size={14} />
                Shared Analysis
              </span>
            </div>
          </div>

          {/* Right Side - CTA Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Create Room</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              <LogIn size={20} />
              <span>Join Room</span>
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-6 pt-6 border-t border-cyan-500/20">
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-medium text-cyan-300">
              ⚡ Lightning Fast Sync
            </div>
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-300">
              🔒 Secure Rooms
            </div>
            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300">
              🎯 Monaco Editor
            </div>
            {/* / */}
          </div>
        </div>
      </div>

      <CollaborationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default CollaborationHub;

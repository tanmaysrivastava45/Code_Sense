import { useCollaboration } from '../context/CollaborationContext';
import { Users, Copy, LogOut, Check } from 'lucide-react';
import { useState } from 'react';

const CollaborationBanner = ({ onLeave }) => {
  const { currentRoom, roomUsers, connected } = useCollaboration();
  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(currentRoom.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    if (confirm('Leave collaboration room?')) {
      if (onLeave) {
        onLeave();
      }
    }
  };

  return (
    <div className="glass-effect border-b border-cyan-500/30 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-sm font-semibold text-white">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="h-6 w-px bg-cyan-500/30"></div>

            <div>
              <h3 className="text-lg font-bold text-white">{currentRoom.name}</h3>
              <div className="flex items-center gap-2">
                <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  ID: {currentRoom.id.substring(0, 8)}...
                </code>
                <button
                  onClick={handleCopyRoomId}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy Room ID"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Active Users */}
            <div className="flex items-center gap-2">
              <Users size={18} className="text-cyan-400" />
              <div className="flex -space-x-2">
                {roomUsers.slice(0, 3).map((user, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-950"
                    style={{ backgroundColor: user.color }}
                    title={user.userName}
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                ))}
                {roomUsers.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-950">
                    +{roomUsers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-300">
                {roomUsers.length} {roomUsers.length === 1 ? 'user' : 'users'}
              </span>
            </div>

            <button
              onClick={handleLeave}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-semibold"
            >
              <LogOut size={18} />
              <span>Leave</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationBanner;

import { useState, useEffect } from 'react';
import { X, Plus, Users, Copy, Check, Trash2, LogIn } from 'lucide-react';
import { useCollaboration } from '../context/CollaborationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {useNavigate} from 'react-router-dom';
const CollaborationModal = ({ isOpen, onClose }) => {
  const { joinRoom } = useCollaboration();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen && activeTab === 'my-rooms') {
      loadMyRooms();
    }
  }, [isOpen, activeTab]);

  const loadMyRooms = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/collaboration/rooms`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMyRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Load rooms error:', error);
    }
  };
const handleCreateRoom = async () => {
  if (!roomName.trim()) {
    alert('Please enter a room name');
    return;
  }

  setLoading(true);
  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await axios.post(
      `${API_URL}/collaboration/rooms/create`,
      { name: roomName, isPublic: false },
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );

    const room = response.data.room;
    // Navigate to dedicated room page
    navigate(`/collaborate/${room.id}`);
    onClose();
  } catch (error) {
    console.error('Create room error:', error);
    alert('Failed to create room');
  } finally {
    setLoading(false);
  }
};

  // In handleJoinRoom function:
  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    // Navigate to dedicated room page
    navigate(`/collaborate/${joinRoomId.trim()}`);
    onClose();
  };

  // In handleJoinExistingRoom function:
  const handleJoinExistingRoom = (roomId, roomName) => {
    // Navigate to dedicated room page
    navigate(`/collaborate/${roomId}`);
    onClose();
  };

  const handleDeleteRoom = async (roomId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this room?')) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.delete(`${API_URL}/collaboration/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMyRooms(myRooms.filter(r => r.id !== roomId));
    } catch (error) {
      console.error('Delete room error:', error);
    }
  };

  const handleCopyRoomId = (roomId) => {
    navigator.clipboard.writeText(roomId);
    setCopied(roomId);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="text-gray-300" size={24} />
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Users className="text-cyan-400" size={32} />
          Start Collaborating
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Plus size={20} className="inline mr-2" />
            Create Room
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'join'
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <LogIn size={20} className="inline mr-2" />
            Join Room
          </button>
          <button
            onClick={() => setActiveTab('my-rooms')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'my-rooms'
                ? 'gradient-primary text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Users size={20} className="inline mr-2" />
            My Rooms
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[300px]">
          {/* Create Room Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Create a New Room</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create a private collaboration room and invite others by sharing the room ID.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g., Interview Prep, DSA Practice"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                    />
                  </div>
                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create & Join Room'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Join Room Tab */}
          {activeTab === 'join' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Join Existing Room</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Enter the room ID shared by your collaborator to join their session.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value)}
                      placeholder="Paste room ID here..."
                      className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                    />
                  </div>
                  <button
                    onClick={handleJoinRoom}
                    className="w-full py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My Rooms Tab */}
          {activeTab === 'my-rooms' && (
            <div className="space-y-4">
              {myRooms.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-500 mb-4" size={48} />
                  <p className="text-gray-400">No rooms yet. Create your first room!</p>
                </div>
              ) : (
                myRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white/5 hover:bg-white/10 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-4 transition-all cursor-pointer group"
                    onClick={() => handleJoinExistingRoom(room.id, room.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">
                          {room.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Created {new Date(room.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                            {room.id.substring(0, 8)}...
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyRoomId(room.id);
                            }}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            {copied === room.id ? (
                              <Check size={14} className="text-green-400" />
                            ) : (
                              <Copy size={14} className="text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinExistingRoom(room.id, room.name)}
                          className="px-4 py-2 gradient-primary text-white rounded-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Join
                        </button>
                        <button
                          onClick={(e) => handleDeleteRoom(room.id, e)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CollaborationModal;

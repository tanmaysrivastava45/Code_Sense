import mongoose from 'mongoose';

const CollaborationRoomSchema = new mongoose.Schema({
  name: { type: String, default: 'Untitled Room' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const CollaborationRoom = mongoose.model('CollaborationRoom', CollaborationRoomSchema);

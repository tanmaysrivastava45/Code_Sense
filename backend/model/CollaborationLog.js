import mongoose from 'mongoose';

const CollaborationLogSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['joined', 'left'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export const CollaborationLog = mongoose.model('CollaborationLog', CollaborationLogSchema);

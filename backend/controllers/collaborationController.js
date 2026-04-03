import mongoose from 'mongoose';
import { CollaborationRoom } from '../model/CollaborationRoom.js';

export const createRoom = async (req, res) => {
  try {
    const { name, isPublic } = req.body;
    const userId = req.user.id;

    const room = await CollaborationRoom.create({
      name: name || 'Untitled Room',
      creatorId: userId,
      isPublic: isPublic || false,
    });

    res.status(201).json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await CollaborationRoom.find({ creatorId: userId }).sort({ createdAt: -1 });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ error: 'Invalid room ID' });
    }

    const room = await CollaborationRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const deleted = await CollaborationRoom.findOneAndDelete({
      _id: roomId,
      creatorId: userId,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Room not found or not authorized' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
};

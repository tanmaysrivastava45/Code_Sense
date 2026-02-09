// import express from 'express';
// import { authenticate } from '../middleware/authMiddleware.js';
// import { supabase } from '../config/supabase.js';
// import { v4 as uuidv4 } from 'uuid';

// const router = express.Router();

// router.post('/rooms/create', authenticate, async (req, res) => {
//   try {
//     const { name, isPublic } = req.body;
//     const userId = req.user.id;
//     const roomId = uuidv4();

//     const { data, error } = await supabase
//       .from('collaboration_rooms')
//       .insert({
//         id: roomId,
//         name: name || 'Untitled Room',
//         creator_id: userId,
//         is_public: isPublic || false,
//         created_at: new Date().toISOString()
//       })
//       .select()
//       .single();

//     if (error) throw error;

//     res.json({ room: data });
//   } catch (error) {
//     console.error('Create room error:', error);
//     res.status(500).json({ error: 'Failed to create room' });
//   }
// });

// router.get('/rooms', authenticate, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const { data, error } = await supabase
//       .from('collaboration_rooms')
//       .select('*')
//       .eq('creator_id', userId)
//       .order('created_at', { ascending: false });

//     if (error) throw error;

//     res.json({ rooms: data });
//   } catch (error) {
//     console.error('Get rooms error:', error);
//     res.status(500).json({ error: 'Failed to fetch rooms' });
//   }
// });

// router.get('/rooms/:roomId', authenticate, async (req, res) => {
//   try {
//     const { roomId } = req.params;

//     const { data, error } = await supabase
//       .from('collaboration_rooms')
//       .select('*')
//       .eq('id', roomId)
//       .single();

//     if (error) throw error;

//     res.json({ room: data });
//   } catch (error) {
//     console.error('Get room error:', error);
//     res.status(500).json({ error: 'Failed to fetch room' });
//   }
// });

// router.delete('/rooms/:roomId', authenticate, async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const userId = req.user.id;

//     const { error } = await supabase
//       .from('collaboration_rooms')
//       .delete()
//       .eq('id', roomId)
//       .eq('creator_id', userId);

//     if (error) throw error;

//     res.json({ message: 'Room deleted successfully' });
//   } catch (error) {
//     console.error('Delete room error:', error);
//     res.status(500).json({ error: 'Failed to delete room' });
//   }
// });

// export default router;

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { CollaborationRoom } from '../model/CollaborationRoom.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// CREATE ROOM
router.post('/rooms/create', authenticateToken, async (req, res) => {
  try {
    const { name, isPublic } = req.body;
    const userId = req.user.id;

    const room = await CollaborationRoom.create({
      _id: uuidv4(), // optional UUID for external use
      name: name || 'Untitled Room',
      creatorId: userId,
      isPublic: isPublic || false,
    });

    res.status(201).json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// GET USER'S ROOMS
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const rooms = await CollaborationRoom.find({ creatorId: userId }).sort({ createdAt: -1 });
    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET SINGLE ROOM
router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await CollaborationRoom.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// DELETE ROOM
router.delete('/rooms/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const deleted = await CollaborationRoom.findOneAndDelete({
      _id: roomId,
      creatorId: userId,
    });

    if (!deleted) return res.status(404).json({ error: 'Room not found or not authorized' });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;


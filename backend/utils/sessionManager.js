import { v4 as uuidv4 } from 'uuid';

/**
 * Session store (in-memory for demo, use Redis in production)
 * Maps sessionId -> { userId, token, createdAt, expiresAt }
 */
const sessions = new Map();

/**
 * Create a new session for a user
 * @param {string} userId - The user's ID
 * @param {string} token - The JWT token
 * @param {number} expiresInMs - Session expiration time in milliseconds
 * @returns {string} unique session ID
 */
export function createSession(userId, token, expiresInMs = 24 * 60 * 60 * 1000) {
  const sessionId = uuidv4();
  const now = Date.now();
  
  sessions.set(sessionId, {
    userId,
    token,
    sessionId,
    createdAt: new Date(now),
    expiresAt: new Date(now + expiresInMs)
  });
  
  return sessionId;
}

/**
 * Retrieve session by ID
 * @param {string} sessionId - The session ID
 * @returns {Object|null} Session object or null if not found/expired
 */
export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) return null;
  
  // Check if expired
  if (Date.now() > session.expiresAt.getTime()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
}

/**
 * Invalidate a session
 * @param {string} sessionId - The session ID to invalidate
 * @returns {boolean} True if session was deleted
 */
export function invalidateSession(sessionId) {
  return sessions.delete(sessionId);
}

/**
 * Get all active sessions for a user
 * @param {string} userId - The user's ID
 * @returns {Array} Array of active sessions
 */
export function getUserSessions(userId) {
  const userSessions = [];
  
  for (const [sessionId, session] of sessions) {
    if (Date.now() > session.expiresAt.getTime()) {
      sessions.delete(sessionId);
      continue;
    }
    
    if (session.userId === userId) {
      userSessions.push(session);
    }
  }
  
  return userSessions;
}

/**
 * Cleanup expired sessions (call periodically)
 * @returns {number} Number of sessions cleaned up
 */
export function cleanupExpiredSessions() {
  let count = 0;
  
  for (const [sessionId, session] of sessions) {
    if (Date.now() > session.expiresAt.getTime()) {
      sessions.delete(sessionId);
      count++;
    }
  }
  
  return count;
}

/**
 * Get session statistics
 * @returns {Object} Stats including total sessions by user
 */
export function getSessionStats() {
  const stats = {
    totalSessions: sessions.size,
    sessionsByUser: {}
  };
  
  for (const session of sessions.values()) {
    if (!stats.sessionsByUser[session.userId]) {
      stats.sessionsByUser[session.userId] = 0;
    }
    stats.sessionsByUser[session.userId]++;
  }
  
  return stats;
}

import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initialize JWT_SECRET in process.env
 * If JWT_SECRET is not set or empty, generates a cryptographically secure random secret
 * @returns {string} The JWT secret (either from env or newly generated)
 */
export function initializeJWTSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) {
    console.log('✅ Using JWT_SECRET from .env');
    return process.env.JWT_SECRET;
  }

  // Generate a cryptographically secure random secret (256 bits)
  const secret = randomBytes(32).toString('hex');
  process.env.JWT_SECRET = secret;
  
  console.log('No JWT_SECRET found in .env');
  console.log('Generated unique JWT_SECRET for this session:');
  console.log(`   ${secret}`);
  console.log('Add this to .env to persist across restarts:');
  console.log(`JWT_SECRET=${secret}`);
  
  return secret;
}

/**
 * Generate a unique session ID using UUID v4
 * Useful for tracking user sessions
 * @returns {string} A unique session ID
 */
export function generateSessionId() {
  return uuidv4();
}

/**
 * Validate JWT_SECRET format (must be non-empty string)
 * @returns {boolean} True if valid
 */
export function validateJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    console.error('❌ JWT_SECRET is not set or invalid');
    return false;
  }
  return true;
}

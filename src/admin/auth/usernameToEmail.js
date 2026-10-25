/**
 * src/admin/auth/usernameToEmail.js
 * 
 * Maps internal username to Supabase Auth email and provides validation helpers.
 * Users never see or type the internal email.
 */

const DEFAULT_AUTH_DOMAIN = process.env.REACT_APP_AUTH_EMAIL_DOMAIN || 'lithioo.app';

/**
 * Converts a username to a safe internal email format for Supabase Auth.
 * @param {string} username
 * @returns {string}
 */
export function usernameToEmail(username) {
  if (!username) return '';
  const clean = String(username).trim().toLowerCase().replace(/\s+/g, '_');
  const safe = /^[a-z0-9_.-]+$/.test(clean)
    ? clean
    : encodeURIComponent(clean).replace(/%/g, 'x').toLowerCase();
  return `${safe}@${DEFAULT_AUTH_DOMAIN}`;
}

/**
 * Validates a username:
 * - Allows Arabic, English, numbers, spaces, and underscores
 * - Length between 2 and 50 characters
 * @param {string} username
 * @returns {boolean}
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim();
  return clean.length >= 2 && clean.length <= 50;
}

/**
 * Normalizes an Egyptian phone number:
 * - Strips all spaces, dashes, parentheses
 * - Converts leading +20 or 20 to 0
 * @param {string} phone
 * @returns {string}
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Validates Egyptian mobile phone number:
 * Must start with 010, 011, 012, or 015 followed by 8 digits (11 digits total).
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  const normalized = normalizePhone(phone);
  return /^01[0125][0-9]{8}$/.test(normalized);
}

/**
 * Validates password:
 * Minimum 6 characters.
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

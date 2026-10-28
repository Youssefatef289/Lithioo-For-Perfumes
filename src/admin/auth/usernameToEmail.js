/**
 * src/admin/auth/usernameToEmail.js
 * 
 * Maps user names and usernames to safe Supabase Auth emails and provides validation helpers.
 * Supports Arabic, English, spaces, and numbers naturally.
 */

// Fallback to owned brand domain if environment variable is not provided
const DEFAULT_AUTH_DOMAIN = process.env.REACT_APP_AUTH_EMAIL_DOMAIN || 'lithiooperfumes.com';

/**
 * Converts any user display name (Arabic, English, with spaces, symbols)
 * into a safe, deterministic lowercase ASCII username slug matching ^[a-z0-9_]{3,30}$.
 * @param {string} name
 * @returns {string}
 */
export function nameToUsernameSlug(name) {
  if (!name) return `user_${Math.random().toString(36).slice(2, 8)}`;
  const trimmed = String(name).trim();

  // If already pure standard ASCII alphanumeric
  const asciiClean = trimmed
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  if (asciiClean.length >= 3 && asciiClean.length <= 30) {
    return asciiClean;
  }

  // Transliterate Arabic letters
  const arabicToLatin = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ء': 'a',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'g', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
    'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
    'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ى': 'a', 'ة': 'a',
  };

  let transliterated = '';
  for (const char of trimmed.toLowerCase()) {
    if (arabicToLatin[char]) {
      transliterated += arabicToLatin[char];
    } else if (/[a-z0-9]/.test(char)) {
      transliterated += char;
    } else if (/\s/.test(char)) {
      transliterated += '_';
    }
  }

  transliterated = transliterated.replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 24);

  if (transliterated.length >= 3) {
    return transliterated;
  }

  const fallback = (transliterated || 'user') + '_' + Math.random().toString(36).slice(2, 7);
  return fallback.slice(0, 30);
}

/**
 * Converts a name or username to a safe internal email format for Supabase Auth.
 * @param {string} usernameOrName
 * @returns {string}
 */
export function usernameToEmail(usernameOrName) {
  if (!usernameOrName) return '';
  const clean = String(usernameOrName).trim();
  if (clean.includes('@')) return clean.toLowerCase();
  const slug = nameToUsernameSlug(clean);
  return `${slug}@${DEFAULT_AUTH_DOMAIN}`;
}

/**
 * Validates a display name / username:
 * - Allows Arabic, English, numbers, spaces, and underscores
 * - Length between 2 and 60 characters
 * @param {string} username
 * @returns {boolean}
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim();
  return clean.length >= 2 && clean.length <= 60;
}

/**
 * Normalizes an Egyptian or international phone number:
 * - Strips spaces, dashes, parentheses
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
 * Validates phone number (tolerant, non-blocking):
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone) return true; // Optional
  const normalized = normalizePhone(phone);
  return normalized.length >= 8 && normalized.length <= 15;
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

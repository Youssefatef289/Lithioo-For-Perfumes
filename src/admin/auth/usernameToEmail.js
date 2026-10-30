/**
 * src/admin/auth/usernameToEmail.js
 * 
 * Maps user names and usernames to safe Supabase Auth emails and provides validation helpers.
 * Dedicated to admin authentication for Lithioo Perfumes.
 */

export const ALLOWED_ADMIN_USERNAME = 'admin_lithioo';

// Fallback to owned brand domain if environment variable is not provided
const DEFAULT_AUTH_DOMAIN = process.env.REACT_APP_AUTH_EMAIL_DOMAIN || 'lithiooperfumes.com';

/**
 * Returns the configured admin email from the environment variable REACT_APP_ADMIN_EMAIL,
 * or safely derives it using the allowed username and domain.
 * @returns {string}
 */
export function getAdminEmail() {
  const envEmail = process.env.REACT_APP_ADMIN_EMAIL;
  if (envEmail && String(envEmail).trim()) {
    return String(envEmail).trim().toLowerCase();
  }
  return `${ALLOWED_ADMIN_USERNAME}@${DEFAULT_AUTH_DOMAIN}`;
}

/**
 * Checks if the given username matches the allowed admin username (case-insensitive).
 * @param {string} username
 * @returns {boolean}
 */
export function isAllowedAdminUsername(username) {
  if (!username || typeof username !== 'string') return false;
  return username.trim().toLowerCase() === ALLOWED_ADMIN_USERNAME;
}

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
 * Converts a name or username to a safe email format for Supabase Auth.
 * For admin_lithioo, it prioritizes REACT_APP_ADMIN_EMAIL.
 * @param {string} usernameOrName
 * @returns {string}
 */
export function usernameToEmail(usernameOrName) {
  if (!usernameOrName) return '';
  const clean = String(usernameOrName).trim();
  if (clean.toLowerCase() === ALLOWED_ADMIN_USERNAME) {
    return getAdminEmail();
  }
  if (clean.includes('@')) return clean.toLowerCase();
  const slug = nameToUsernameSlug(clean);
  return `${slug}@${DEFAULT_AUTH_DOMAIN}`;
}

export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  const clean = username.trim();
  return clean.length >= 2 && clean.length <= 60;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

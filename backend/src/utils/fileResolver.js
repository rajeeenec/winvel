import { db } from '../config/database.js';

/**
 * Resolves a file ID or relative path to a full public URL path.
 * If the value is a numeric ID, it queries the `files` database table.
 * If it is already a path, it returns it as-is.
 * 
 * @param {string|number} value - The file ID or file path
 * @returns {Promise<string>} The resolved file URL path
 */
export async function resolveFileUrl(value) {
  if (!value) return '';

  // Check if value is a numeric ID
  const isNumericId = /^\d+$/.test(String(value).trim());

  if (isNumericId) {
    try {
      const fileId = parseInt(value, 10);
      const file = await db('files').where({ id: fileId }).first();
      if (file) {
        return `/uploads/${file.filename}`;
      }
    } catch (err) {
      console.error(`Error resolving file URL for ID ${value}:`, err.message);
    }
  }

  // Fallback to returning the value as-is (e.g., relative static paths or external URLs)
  return value;
}

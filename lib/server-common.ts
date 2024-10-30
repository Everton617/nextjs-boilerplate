import { randomBytes } from 'crypto';
import type { NextApiRequest } from 'next';

// Function to force consume the response body to avoid memory leaks
export const forceConsume = async (response: unknown) => {
  try {
    if (typeof response === 'object' && response !== null && 'text' in response) {
      await (response as Response).text(); // Type assertion only AFTER the check
    } else {
      // Handle the case where response doesn't have a .text() method
      console.error("Response is not a valid object with a 'text' method.");
    }
  } catch (error) {
    console.error(error);
  }
};

// Create token
export function generateToken(length = 64) {
  const tokenBytes = randomBytes(Math.ceil(length / 2)); // Convert length from bytes to hex

  return tokenBytes.toString('hex').slice(0, length);
}

// Fetch the auth token from the request headers
export const extractAuthToken = (req: NextApiRequest): string | null => {
  const authHeader = req.headers.authorization || null;

  return authHeader ? authHeader.split(' ')[1] : null;
};

export const validateEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

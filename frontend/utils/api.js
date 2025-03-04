import { logError } from "./logger";

// utils/api.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function registerShop(userData) {
  try {
    console.log('userData', userData);
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    logError('Registration error:', {
      userData: userData,
      error: error,
    });
    throw error;
  }
}
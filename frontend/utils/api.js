import axios from 'axios';
import { logError, logInfo } from "./logger";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sousbot-backend.vercel.app';

// Default headers for all requests
const getDefaultHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Adding Origin header can help with CORS issues
    'Origin': typeof window !== 'undefined' ? window.location.origin : undefined
  };
};

// Helper function to handle fetch API responses
const handleFetchResponse = async (response) => {
  if (!response.ok) {
    // Log the error response for debugging
    let errorText;
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Could not parse error response';
    }
    
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      error: errorText
    });
    
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

// Fallback to fetch if axios fails
const fetchWithFallback = async (url, options) => {
  logInfo(`Making ${options.method} request to: ${url}`);
  console.log(`Request payload:`, options.data || options.body || 'No data');
  
  try {
    // First attempt with axios
    const axiosOptions = {
      method: options.method,
      url: url,
      data: options.data,
      headers: options.headers,
      timeout: 15000, // 15 second timeout
    };
    
    const axiosResponse = await axios(axiosOptions);
    console.log(`${options.method} response (axios):`, axiosResponse.status, axiosResponse.statusText);
    console.log('Response data:', axiosResponse.data);
    
    return axiosResponse.data;
  } catch (axiosError) {
    // If axios fails, try with fetch API as a fallback
    console.log('Axios request failed, trying with fetch API...');
    console.log('Axios error:', axiosError.message);
    
    const fetchOptions = {
      method: options.method,
      headers: options.headers,
      body: options.data ? JSON.stringify(options.data) : options.body,
      credentials: options.credentials || 'omit',
      mode: 'cors' // Explicitly set CORS mode
    };
    
    const fetchResponse = await fetch(url, fetchOptions);
    return handleFetchResponse(fetchResponse);
  }
};

// Check backend health
export const apiCheckHealth = async () => {
  try {
    const url = `${API_BASE_URL}/health`;
    
    logInfo('Checking health', { url });
    
    return await fetchWithFallback(url, {
      method: 'GET',
      headers: getDefaultHeaders()
    });
  } catch (error) {
    logError('Health check error:', { message: error.message });
    console.error('Health check error:', error);
    throw error;
  }
};

// Register a new shop
export const registerShop = async (userData) => {
  try {
    const url = `${API_BASE_URL}/api/register`;
    
    logInfo('Registering shop', {
      url: url,
      userData: userData,
    });
    
    return await fetchWithFallback(url, {
      method: 'POST',
      headers: getDefaultHeaders(),
      data: userData,
      credentials: 'omit', // Change to 'include' if you need to send cookies
    });
  } catch (error) {
    logError('Registration error:', {
      userData: userData,
      message: error.message
    });
    console.error('Shop registration error:', error);
    throw error;
  }
};

// Get products by user ID
export const getProductsByUser = async (userId) => {
  try {
    const url = `${API_BASE_URL}/api/products/${userId}`;
    
    logInfo('Getting products for user', {
      url: url,
      userId: userId
    });
    
    return await fetchWithFallback(url, {
      method: 'GET',
      headers: getDefaultHeaders()
    });
  } catch (error) {
    logError('Get products error:', {
      userId: userId,
      message: error.message
    });
    console.error('Get products error:', error);
    throw error;
  }
};

// Toggle product availability
export const toggleProductAvailability = async (productId) => {
  try {
    const url = `${API_BASE_URL}/api/products/${productId}/availability`;
    
    logInfo('Toggling product availability', {
      url: url,
      productId: productId
    });
    
    return await fetchWithFallback(url, {
      method: 'PATCH',
      headers: getDefaultHeaders()
    });
  } catch (error) {
    logError('Toggle product availability error:', {
      productId: productId,
      message: error.message
    });
    console.error('Toggle product availability error:', error);
    throw error;
  }
};
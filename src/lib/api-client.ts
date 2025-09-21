/**
 * API client utility for making authenticated requests
 */

// Get the current user from localStorage
function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 * @param url The API endpoint URL
 * @param options Request options (method, headers, body, etc.)
 * @returns Promise with the response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = getCurrentUser();
  
  // Set up default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication header if user is logged in
  if (user) {
    // For demo purposes, we'll use the user ID as a Bearer token
    // In production, you should use proper JWT tokens
    headers['Authorization'] = `Bearer ${user.id}`;
    headers['X-User-ID'] = user.id;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: (url: string) => fetchWithAuth(url, { method: 'GET' }),
  post: (url: string, data?: any) => fetchWithAuth(url, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  put: (url: string, data?: any) => fetchWithAuth(url, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (url: string) => fetchWithAuth(url, { method: 'DELETE' }),
  patch: (url: string, data?: any) => fetchWithAuth(url, { 
    method: 'PATCH', 
    body: data ? JSON.stringify(data) : undefined 
  }),
};

/**
 * Check if the user is authenticated
 */
export function isAuthenticated() {
  return !!getCurrentUser();
}

/**
 * Get the current user's ID
 */
export function getCurrentUserId() {
  const user = getCurrentUser();
  return user?.id;
}

/**
 * Get the current user's role
 */
export function getCurrentUserRole() {
  const user = getCurrentUser();
  return user?.role;
}
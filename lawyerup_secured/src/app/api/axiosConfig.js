import axios from 'axios';

const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important: Send cookies (httpOnly cookies) with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch CSRF token from backend
const fetchCsrfToken = async () => {
  try {
    await axiosInstance.get(`${BASE_URL}/api/auth/csrf-token`);
    // Token is automatically set in XSRF-TOKEN cookie by backend
  } catch (err) {
    console.error('[CSRF Token Fetch Error]', err);
  }
};

// Initialize CSRF token on app load
// This ensures we have a CSRF token before making any authenticated requests
if (typeof window !== 'undefined') {
  // Fetch CSRF token when app loads
  fetchCsrfToken();
  
  // Also fetch on visibility change (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      fetchCsrfToken();
    }
  });
}

// Request interceptor to add CSRF token if available
axiosInstance.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie (set by backend as XSRF-TOKEN)
    // Backend sets this cookie via addCsrfToken middleware
    const csrfToken = getCookie('XSRF-TOKEN');
    
    // Add CSRF token to state-changing requests
    // OWASP: A01:2021 – Broken Access Control (CSRF Protection)
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and CSRF token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // If backend sends a new CSRF token in response, it's automatically set in cookie
    // Frontend reads from cookie, so no action needed
    return response;
  },
  (error) => {
    // Handle CSRF token errors
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.error;
      
      if (errorCode === 'CSRF_TOKEN_MISSING' || errorCode === 'CSRF_TOKEN_INVALID') {
        // CSRF token missing or invalid - fetch a new one and retry
        fetchCsrfToken();
        error.userMessage = 'Security token expired. Please try again.';
        return Promise.reject(error);
      }
    }
    
    // Handle account lockout (423)
    if (error.response?.status === 423) {
      const lockUntil = error.response?.data?.lockUntil;
      const message = lockUntil
        ? `Account locked. Try again after ${new Date(lockUntil).toLocaleString()}`
        : 'Account temporarily locked due to too many failed attempts. Please try again later.';
      error.userMessage = message;
    }
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers['retry-after'];
      const message = retryAfter
        ? `Too many requests. Please try again after ${retryAfter} seconds.`
        : 'Too many requests. Please try again later.';
      error.userMessage = message;
    }
    
    // Handle password expired (403)
    if (error.response?.status === 403 && error.response?.data?.message?.includes('expired')) {
      error.userMessage = 'Your password has expired. Please change it to continue.';
      error.requiresPasswordChange = true;
    }
    
    return Promise.reject(error);
  }
);

// Helper to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default axiosInstance;


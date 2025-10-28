// client\src\utils\api.js
import axios from "axios";

export const getCsrfToken = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/csrf-token`;
  console.log("Fetching CSRF token from:", url); // Add log
  const res = await fetch(url, {
    credentials: "include",
  });
  const data = await res.json();
  // Set default CSRF header for axios POST/PUT/PATCH/DELETE
  axios.defaults.headers.post['X-CSRF-Token'] = data.csrfToken;
  axios.defaults.headers.put['X-CSRF-Token'] = data.csrfToken;
  axios.defaults.headers.patch['X-CSRF-Token'] = data.csrfToken;
  axios.defaults.headers.delete['X-CSRF-Token'] = data.csrfToken;
  return data.csrfToken;
};

// Helper to initialize CSRF token at app startup
export const initCsrf = async () => {
  try {
    await getCsrfToken();
  } catch (e) {
    // Ignore errors, will retry on first mutating request
  }
};

// Axios instance with CSRF auto-fetch for mutating requests
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Intercept mutating requests and auto-fetch CSRF token (sets XSRF-TOKEN cookie)
axiosInstance.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(method);
  if (needsCsrf) {
    // Ensure CSRF token is set before mutating requests
    if (!axios.defaults.headers.post['X-CSRF-Token']) {
      await getCsrfToken();
    }
    // Attach the token from defaults to the current request config
    config.headers['X-CSRF-Token'] = axios.defaults.headers.post['X-CSRF-Token'];
  }
  return config;
});

// Response interceptor: On 403/419, refresh CSRF token and retry once
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Only retry once
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 419) &&
      !originalRequest._csrfRetried
    ) {
      originalRequest._csrfRetried = true;
      try {
        // FIX: Call getCsrfToken to correctly fetch a new token AND update axios defaults
        await getCsrfToken(); 
        // The original request will be retried with the updated token
        return axiosInstance(originalRequest);
      } catch (e) {
        // If CSRF refresh fails, propagate original error
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

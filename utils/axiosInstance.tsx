import axios from 'axios';
import useUserStore from '@/state/user';

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 5000,
});

// // We'll store the access token in memory for security
// let accessToken: string | null = null;

const { setAccessToken, getAccessToken } = useUserStore.getState();
// Function to set the token, called after login/refresh
export const setAuthToken = (token: string | null) => {
  setAccessToken(token);
};

// --- Request Interceptor ---
// Attaches the access token to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// --- Response Interceptor ---
// Handles token refresh logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response, // Simply return the response if it's successful
  (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        // If we are already refreshing, push the new request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // Make the call to the refresh token endpoint
        // The HttpOnly cookie is sent automatically by the browser
        axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh`, {}, { withCredentials: true })
          .then(res => {
            const newAccessToken = res.data.accessToken;
            setAuthToken(newAccessToken); // Update our in-memory token

            // Update the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // Process the queue with the new token
            processQueue(null, newAccessToken);

            // Retry the original request
            resolve(axiosInstance(originalRequest));
          })
          .catch(err => {
            // If refresh fails, clear token, process queue with error, and redirect
            setAuthToken(null);
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
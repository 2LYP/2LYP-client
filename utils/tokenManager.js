// utils/tokenManager.js
export const clearTokens = () => {
  // Clear any stored tokens from localStorage
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenVersion');
};

export const handleAuthError = (error) => {
  // If we get token version mismatch or token invalidated
  if (error?.response?.status === 403 && 
      (error.response.data?.error === "Invalid refresh token" || 
       error.response.data?.requireRelogin)) {
    clearTokens();
    return true; // Indicates need to relogin
  }
  return false;
};

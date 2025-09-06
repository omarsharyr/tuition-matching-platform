// frontend/src/utils/auth.js
export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

export const getUser = () => {
  const s = localStorage.getItem("user");
  try { return s ? JSON.parse(s) : null; } catch { return null; }
};
export const setUser = (u) => localStorage.setItem("user", JSON.stringify(u));
export const clearUser = () => localStorage.removeItem("user");

export const isVerified = () => getUser()?.status === "VERIFIED";
export const hasRole = (role) => getUser()?.role === role;

// Logout function
export const logout = () => {
  // Clear all authentication data from localStorage
  clearToken();
  clearUser();
  
  // Redirect to home page
  window.location.href = "/";
};

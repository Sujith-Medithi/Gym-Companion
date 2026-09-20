import api from './api.js';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 */
export const registerUser = (data) => api.post('/auth/register', data);

/**
 * Login a user.
 * @param {{ email: string, password: string }} data
 */
export const loginUser = (data) => api.post('/auth/login', data);

/**
 * Login or register via Google.
 * @param {string} credential - Google JWT token
 */
export const loginWithGoogle = (credential) => api.post('/auth/google', { credential });

/**
 * Logout the current user (clears the httpOnly cookie).
 */
export const logoutUser = () => api.post('/auth/logout');

/**
 * Get the currently logged-in user from the JWT cookie.
 */
export const getMe = () => api.get('/auth/me');

/**
 * Update user settings in MongoDB.
 * @param {object} data
 */
export const updateSettings = (data) => api.put('/auth/settings', data);

export const deactivateAccount = () => api.put('/auth/deactivate');

export const deleteAccount = () => api.delete('/auth/delete');

export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const verifyResetCode = (data) => api.post('/auth/verify-reset-code', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

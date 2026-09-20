import { Router } from 'express';
import { register, login, logout, getMe, updateSettings, googleAuth, deactivateAccount, deleteAccount, forgotPassword, verifyResetCode, resetPassword } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);
router.put('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);

export default router;

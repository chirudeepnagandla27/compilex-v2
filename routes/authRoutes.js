import { Router } from 'express';
import { register, login, me, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authGuard, roleGuard } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected route to get current user profile
router.get('/me', authGuard, me);

// Example of role-protected route (future expansion)
router.get('/admin/ping', authGuard, roleGuard('admin'), (req, res) => res.json({ message: 'pong' }));

export default router;
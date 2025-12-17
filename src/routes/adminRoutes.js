const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllUsers,
  getAllRooms,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
  deleteUser
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', authenticate, authorize('ADMIN'), getDashboardStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [OWNER, GUEST, ADMIN]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', [
  authenticate,
  authorize('ADMIN'),
  query('role').optional().isIn(['OWNER', 'GUEST', 'ADMIN']).withMessage('Invalid role'),
  handleValidationErrors
], getAllUsers);

/**
 * @swagger
 * /api/admin/rooms:
 *   get:
 *     summary: Get all rooms (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE]
 *     responses:
 *       200:
 *         description: List of all rooms
 */
router.get('/rooms', [
  authenticate,
  authorize('ADMIN'),
  query('status').optional().isIn(['AVAILABLE', 'UNAVAILABLE']).withMessage('Invalid status'),
  handleValidationErrors
], getAllRooms);

/**
 * @swagger
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of all bookings
 */
router.get('/bookings', [
  authenticate,
  authorize('ADMIN'),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid status'),
  handleValidationErrors
], getAllBookings);

/**
 * @swagger
 * /api/admin/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CANCELLED]
 *     responses:
 *       200:
 *         description: Booking status updated
 */
router.patch('/bookings/:id/status', [
  authenticate,
  authorize('ADMIN'),
  body('status').isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid status'),
  handleValidationErrors
], updateBookingStatus);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;

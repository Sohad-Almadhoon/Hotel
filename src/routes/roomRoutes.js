const express = require('express');
const { body, query } = require('express-validator');
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getMyRooms
} = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms with optional filters
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, UNAVAILABLE]
 *       - in: query
 *         name: checkIn
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: checkOut
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of rooms
 */
router.get('/', [
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('minCapacity').optional().isInt({ min: 1 }).withMessage('Min capacity must be at least 1'),
  query('maxCapacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be at least 1'),
  query('status').optional().isIn(['AVAILABLE', 'UNAVAILABLE']).withMessage('Invalid status'),
  query('checkIn').optional().isISO8601().withMessage('Invalid check-in date'),
  query('checkOut').optional().isISO8601().withMessage('Invalid check-out date'),
  handleValidationErrors
], getRooms);

/**
 * @swagger
 * /api/rooms/my-rooms:
 *   get:
 *     summary: Get rooms owned by current user
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of owned rooms
 */
router.get('/my-rooms', authenticate, authorize('OWNER'), getMyRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 *       404:
 *         description: Room not found
 */
router.get('/:id', getRoomById);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room (Owner only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE]
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.post('/', [
  authenticate,
  authorize('OWNER'),
  body('name').notEmpty().withMessage('Room name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['AVAILABLE', 'UNAVAILABLE']).withMessage('Invalid status'),
  handleValidationErrors
], createRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update room (Owner only - own rooms)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               capacity:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE]
 *     responses:
 *       200:
 *         description: Room updated successfully
 */
router.put('/:id', [
  authenticate,
  authorize('OWNER'),
  body('name').optional().notEmpty().withMessage('Room name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['AVAILABLE', 'UNAVAILABLE']).withMessage('Invalid status'),
  handleValidationErrors
], updateRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete room (Owner only - own rooms)
 *     tags: [Rooms]
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
 *         description: Room deleted successfully
 */
router.delete('/:id', authenticate, authorize('OWNER'), deleteRoom);

module.exports = router;

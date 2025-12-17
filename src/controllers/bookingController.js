const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new booking (Guest only)
 */
const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ 
        error: 'Check-out date must be after check-in date' 
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ 
        error: 'Check-in date cannot be in the past' 
      });
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkIn: { lte: checkInDate } },
              { checkOut: { gt: checkInDate } }
            ]
          },
          {
            AND: [
              { checkIn: { lt: checkOutDate } },
              { checkOut: { gte: checkOutDate } }
            ]
          },
          {
            AND: [
              { checkIn: { gte: checkInDate } },
              { checkOut: { lte: checkOutDate } }
            ]
          }
        ]
      }
    });

    if (overlappingBookings.length > 0) {
      return res.status(409).json({ 
        error: 'Room is already booked for the selected dates' 
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        roomId,
        guestId: req.user.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'PENDING'
      },
      include: {
        room: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for current user (Guest)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {
      guestId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check permissions
    if (
      booking.guestId !== req.user.id &&
      booking.room.ownerId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ 
        error: 'You do not have permission to view this booking' 
      });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking (Guest - own bookings only)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is the guest who made the booking
    if (booking.guestId !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only cancel your own bookings' 
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ 
        error: 'Booking is already cancelled' 
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        room: true,
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings for a specific room (Owner of the room)
 */
const getRoomBookings = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { status } = req.query;

    // Check if room exists and belongs to owner
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'You can only view bookings for your own rooms' 
      });
    }

    const where = {
      roomId
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        checkIn: 'asc'
      }
    });

    res.json({
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getRoomBookings
};

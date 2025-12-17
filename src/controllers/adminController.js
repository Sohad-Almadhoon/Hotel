const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedRooms: true,
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rooms (Admin only)
 */
const getAllRooms = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const rooms = await prisma.room.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (Admin only)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
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
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true
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
 * Update booking status (Admin only)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be PENDING, CONFIRMED, or CANCELLED' 
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
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
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get dashboard statistics (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      availableRooms,
      usersByRole,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          room: {
            select: {
              name: true
            }
          },
          guest: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          byRole: usersByRole.reduce((acc, { role, _count }) => {
            acc[role] = _count;
            return acc;
          }, {})
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          unavailable: totalRooms - availableRooms
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: totalBookings - pendingBookings - confirmedBookings
        }
      },
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: 'You cannot delete your own account' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedRooms: {
          include: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'PENDING'] }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has rooms with active bookings
    const hasActiveBookings = user.ownedRooms.some(room => room.bookings.length > 0);
    
    if (hasActiveBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete user with rooms that have active bookings' 
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllRooms,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
  deleteUser
};

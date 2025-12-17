const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create a new room (Owner only)
 */
const createRoom = async (req, res, next) => {
  try {
    const { name, description, price, capacity, status } = req.body;

    const room = await prisma.room.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        status: status || 'AVAILABLE',
        ownerId: req.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rooms with optional filters
 */
const getRooms = async (req, res, next) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      minCapacity, 
      maxCapacity, 
      status,
      checkIn,
      checkOut
    } = req.query;

    // Build filter object
    const where = {};

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minCapacity || maxCapacity) {
      where.capacity = {};
      if (minCapacity) where.capacity.gte = parseInt(minCapacity);
      if (maxCapacity) where.capacity.lte = parseInt(maxCapacity);
    }

    if (status) {
      where.status = status;
    }

    // If date range is provided, filter out rooms with overlapping bookings
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Get rooms that have no overlapping confirmed or pending bookings
      const roomsWithBookings = await prisma.room.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          bookings: {
            where: {
              AND: [
                { status: { in: ['CONFIRMED', 'PENDING'] } },
                {
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
              ]
            }
          }
        }
      });

      // Filter out rooms that have overlapping bookings
      const availableRooms = roomsWithBookings.filter(room => room.bookings.length === 0);
      
      // Remove bookings from response
      const roomsResponse = availableRooms.map(({ bookings, ...room }) => room);

      return res.json({
        count: roomsResponse.length,
        rooms: roomsResponse
      });
    }

    // Regular query without date filtering
    const rooms = await prisma.room.findMany({
      where,
      include: {
        owner: {
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
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get room by ID
 */
const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] }
          },
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
};

/**
 * Update room (Owner only - own rooms)
 */
const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, capacity, status } = req.body;

    // Check if room exists and belongs to owner
    const existingRoom = await prisma.room.findUnique({
      where: { id }
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (existingRoom.ownerId !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only update your own rooms' 
      });
    }

    // Update room
    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(status && { status })
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete room (Owner only - own rooms)
 */
const deleteRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if room exists and belongs to owner
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] }
          }
        }
      }
    });

    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (existingRoom.ownerId !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only delete your own rooms' 
      });
    }

    // Check for active bookings
    if (existingRoom.bookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete room with active bookings' 
      });
    }

    await prisma.room.delete({
      where: { id }
    });

    res.json({
      message: 'Room deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get rooms owned by current user
 */
const getMyRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        ownerId: req.user.id
      },
      include: {
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'PENDING'] }
          },
          include: {
            guest: {
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
      count: rooms.length,
      rooms
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getMyRooms
};

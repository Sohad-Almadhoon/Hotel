import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminFiltersDto, UpdateBookingStatusDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(filters: AdminFiltersDto) {
    const where: any = {};
    if (filters.role) {
      where.role = filters.role;
    }

    const users = await this.prisma.user.findMany({
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
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: users.length,
      users,
    };
  }

  async getAllRooms(filters: AdminFiltersDto) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: rooms.length,
      rooms,
    };
  }

  async getAllBookings(filters: AdminFiltersDto) {
    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        room: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: bookings.length,
      bookings,
    };
  }

  async updateBookingStatus(id: string, updateStatusDto: UpdateBookingStatusDto) {
    const { status } = updateStatusDto;

    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        room: true,
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalRooms,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      availableRooms,
      usersByRole,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.room.count(),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'PENDING' } }),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.room.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          room: { select: { name: true } },
          guest: { select: { name: true, email: true } },
        },
      }),
    ]);

    return {
      statistics: {
        users: {
          total: totalUsers,
          byRole: usersByRole.reduce((acc, { role, _count }) => {
            acc[role] = _count;
            return acc;
          }, {}),
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          unavailable: totalRooms - availableRooms,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: totalBookings - pendingBookings - confirmedBookings,
        },
      },
      recentBookings,
    };
  }

  async deleteUser(adminId: string, id: string) {
    if (id === adminId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ownedRooms: {
          include: {
            bookings: {
              where: { status: { in: ['CONFIRMED', 'PENDING'] } },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasActiveBookings = user.ownedRooms.some((room) => room.bookings.length > 0);

    if (hasActiveBookings) {
      throw new BadRequestException('Cannot delete user with rooms that have active bookings');
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'User deleted successfully',
    };
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, BookingFiltersDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto) {
    const { roomId, checkIn, checkOut } = createBookingDto;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    if (checkInDate < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    const room = await this.prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status !== 'AVAILABLE') {
      throw new BadRequestException('Room is not available');
    }

    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          { AND: [{ checkIn: { lte: checkInDate } }, { checkOut: { gt: checkInDate } }] },
          { AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gte: checkOutDate } }] },
          { AND: [{ checkIn: { gte: checkInDate } }, { checkOut: { lte: checkOutDate } }] },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      throw new ConflictException('Room is already booked for the selected dates');
    }

    const booking = await this.prisma.booking.create({
      data: {
        roomId,
        guestId: userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'PENDING',
      },
      include: {
        room: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Booking created successfully',
      booking,
    };
  }

  async getMyBookings(userId: string, filters: BookingFiltersDto) {
    const where: any = { guestId: userId };

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
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: bookings.length,
      bookings,
    };
  }

  async getBookingById(userId: string, userRole: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.guestId !== userId &&
      booking.room.ownerId !== userId &&
      userRole !== 'ADMIN'
    ) {
      throw new ForbiddenException('You do not have permission to view this booking');
    }

    return { booking };
  }

  async cancelBooking(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        room: true,
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    };
  }

  async getRoomBookings(userId: string, userRole: string, roomId: string, filters: BookingFiltersDto) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.ownerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only view bookings for your own rooms');
    }

    const where: any = { roomId };

    if (filters.status) {
      where.status = filters.status;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { checkIn: 'asc' },
    });

    return {
      count: bookings.length,
      bookings,
    };
  }
}

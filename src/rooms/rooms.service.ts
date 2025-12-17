import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, RoomFiltersDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        ...createRoomDto,
        status: createRoomDto.status || 'AVAILABLE',
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      message: 'Room created successfully',
      room,
    };
  }

  async getRooms(filters: RoomFiltersDto) {
    const where: any = {};

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.minCapacity || filters.maxCapacity) {
      where.capacity = {};
      if (filters.minCapacity) where.capacity.gte = filters.minCapacity;
      if (filters.maxCapacity) where.capacity.lte = filters.maxCapacity;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.checkIn && filters.checkOut) {
      const checkInDate = new Date(filters.checkIn);
      const checkOutDate = new Date(filters.checkOut);

      const roomsWithBookings = await this.prisma.room.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          bookings: {
            where: {
              AND: [
                { status: { in: ['CONFIRMED', 'PENDING'] } },
                {
                  OR: [
                    { AND: [{ checkIn: { lte: checkInDate } }, { checkOut: { gt: checkInDate } }] },
                    { AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gte: checkOutDate } }] },
                    { AND: [{ checkIn: { gte: checkInDate } }, { checkOut: { lte: checkOutDate } }] },
                  ],
                },
              ],
            },
          },
        },
      });

      const availableRooms = roomsWithBookings
        .filter((room) => room.bookings.length === 0)
        .map(({ bookings, ...room }) => room);

      return {
        count: availableRooms.length,
        rooms: availableRooms,
      };
    }

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: rooms.length,
      rooms,
    };
  }

  async getRoomById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          select: { id: true, checkIn: true, checkOut: true, status: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return { room };
  }

  async updateRoom(userId: string, id: string, updateRoomDto: UpdateRoomDto) {
    const existingRoom = await this.prisma.room.findUnique({ where: { id } });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    if (existingRoom.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own rooms');
    }

    const room = await this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Room updated successfully',
      room,
    };
  }

  async deleteRoom(userId: string, id: string) {
    const existingRoom = await this.prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
        },
      },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    if (existingRoom.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own rooms');
    }

    if (existingRoom.bookings.length > 0) {
      throw new BadRequestException('Cannot delete room with active bookings');
    }

    await this.prisma.room.delete({ where: { id } });

    return {
      message: 'Room deleted successfully',
    };
  }

  async getMyRooms(userId: string) {
    const rooms = await this.prisma.room.findMany({
      where: { ownerId: userId },
      include: {
        bookings: {
          where: { status: { in: ['CONFIRMED', 'PENDING'] } },
          include: {
            guest: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: rooms.length,
      rooms,
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, BookingFiltersDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Bookings')
@Controller('api/bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GUEST')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new booking (Guest only)' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 409, description: 'Room is already booked' })
  async createBooking(@CurrentUser() user: any, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, createBookingDto);
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GUEST')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get current user's bookings" })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async getMyBookings(@CurrentUser() user: any, @Query() filters: BookingFiltersDto) {
    return this.bookingsService.getMyBookings(user.id, filters);
  }

  @Get('room/:roomId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all bookings for a room (Owner only)' })
  @ApiResponse({ status: 200, description: 'List of bookings for the room' })
  async getRoomBookings(
    @CurrentUser() user: any,
    @Param('roomId') roomId: string,
    @Query() filters: BookingFiltersDto,
  ) {
    return this.bookingsService.getRoomBookings(user.id, user.role, roomId, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  async getBookingById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.getBookingById(user.id, user.role, id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GUEST')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel booking (Guest - own bookings)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  async cancelBooking(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancelBooking(user.id, id);
  }
}

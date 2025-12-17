import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminFiltersDto, UpdateBookingStatusDto } from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getAllUsers(@Query() filters: AdminFiltersDto) {
    return this.adminService.getAllUsers(filters);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all rooms (Admin only)' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully' })
  getAllRooms(@Query() filters: AdminFiltersDto) {
    return this.adminService.getAllRooms(filters);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
  getAllBookings(@Query() filters: AdminFiltersDto) {
    return this.adminService.getAllBookings(filters);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  updateBookingStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, updateStatusDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete user with active bookings' })
  deleteUser(@CurrentUser() adminUser: any, @Param('id') id: string) {
    return this.adminService.deleteUser(adminUser.id, id);
  }
}

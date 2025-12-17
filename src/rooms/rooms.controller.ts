import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto, RoomFiltersDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Rooms')
@Controller('api/rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all rooms with optional filters' })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  async getRooms(@Query() filters: RoomFiltersDto) {
    return this.roomsService.getRooms(filters);
  }

  @Get('my-rooms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get rooms owned by current user' })
  @ApiResponse({ status: 200, description: 'List of owned rooms' })
  async getMyRooms(@CurrentUser() user: any) {
    return this.roomsService.getMyRooms(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by ID' })
  @ApiResponse({ status: 200, description: 'Room details' })
  @ApiResponse({ status: 404, description: 'Room not found' })
  async getRoomById(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new room (Owner only)' })
  @ApiResponse({ status: 201, description: 'Room created successfully' })
  async createRoom(@CurrentUser() user: any, @Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.createRoom(user.id, createRoomDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update room (Owner only - own rooms)' })
  @ApiResponse({ status: 200, description: 'Room updated successfully' })
  async updateRoom(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomsService.updateRoom(user.id, id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete room (Owner only - own rooms)' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully' })
  async deleteRoom(@CurrentUser() user: any, @Param('id') id: string) {
    return this.roomsService.deleteRoom(user.id, id);
  }
}

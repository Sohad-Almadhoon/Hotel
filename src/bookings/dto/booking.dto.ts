import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class CreateBookingDto {
  @ApiProperty({ example: 'room-uuid-here' })
  @IsString()
  roomId: string;

  @ApiProperty({ example: '2025-01-01T14:00:00Z' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2025-01-05T11:00:00Z' })
  @IsDateString()
  checkOut: string;
}

export class BookingFiltersDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status: BookingStatus;
}

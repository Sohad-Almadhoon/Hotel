import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AdminUserRole {
  OWNER = 'OWNER',
  GUEST = 'GUEST',
  ADMIN = 'ADMIN',
}

export enum AdminRoomStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum AdminBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class AdminFiltersDto {
  @ApiPropertyOptional({ enum: AdminUserRole })
  @IsOptional()
  @IsEnum(AdminUserRole)
  role?: AdminUserRole;

  @ApiPropertyOptional({ enum: AdminRoomStatus })
  @IsOptional()
  @IsEnum(AdminRoomStatus)
  status?: AdminRoomStatus;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: AdminBookingStatus })
  @IsEnum(AdminBookingStatus)
  status: AdminBookingStatus;
}

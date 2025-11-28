import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class CreateZoneDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  warehouseId!: string;
}

export class CreateLocationDto {
  @IsNotEmpty()
  @IsString()
  code!: string;

  @IsNotEmpty()
  @IsString()
  type!: 'PICKING' | 'BULK' | 'RECEIVING' | 'DISPATCH';

  @IsNotEmpty()
  @IsString()
  zoneId!: string;
}

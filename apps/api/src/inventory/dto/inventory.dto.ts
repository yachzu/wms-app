import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateStockMovementDto {
  @IsNotEmpty()
  @IsEnum(MovementType)
  type!: MovementType;

  @IsNotEmpty()
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  fromLocationId?: string;

  @IsOptional()
  @IsString()
  toLocationId?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}

export class GetInventoryBalanceDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  locationId?: string;
}

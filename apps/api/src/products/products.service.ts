import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Check if SKU already exists
    const existing = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existing) {
      throw new ConflictException('Product with this SKU already exists');
    }

    const data = {
      ...createProductDto,
      barcode:
        createProductDto.barcode === '' ? null : createProductDto.barcode,
    };

    return this.prisma.product.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventoryItems: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id); // Ensure product exists

    const data = {
      ...updateProductDto,
      barcode:
        updateProductDto.barcode === '' ? null : updateProductDto.barcode,
    };

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure product exists

    return this.prisma.product.delete({
      where: { id },
    });
  }
}

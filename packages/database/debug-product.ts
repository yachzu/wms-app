
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking existing products...');
    const products = await prisma.product.findMany();
    console.log('Products:', products);

    console.log('Attempting to create product with empty barcode...');
    try {
        const p1 = await prisma.product.create({
            data: {
                sku: 'DEBUG-001',
                name: 'Debug Product',
                description: 'Test',
                minStock: 0,
                barcode: '', // Testing empty string
            },
        });
        console.log('Created product with empty barcode:', p1);
    } catch (e) {
        console.error('Error creating product with empty barcode:', e);
    }

    console.log('Attempting to create product with null barcode...');
    try {
        const p2 = await prisma.product.create({
            data: {
                sku: 'DEBUG-002',
                name: 'Debug Product 2',
                description: 'Test',
                minStock: 0,
                barcode: null, // Testing null
            },
        });
        console.log('Created product with null barcode:', p2);
    } catch (e) {
        console.error('Error creating product with null barcode:', e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

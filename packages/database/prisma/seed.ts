import { PrismaClient, Role, LocationType, MovementType, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // SAFETY CHECK: Prevent accidental seeding in production
    if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
        console.error('❌ SEEDING ABORTED: You are in PRODUCTION environment!');
        console.error('   This script wipes the database. If you really want to do this,');
        console.error('   run with FORCE_SEED=true environment variable.');
        process.exit(1);
    }

    // 0. Clean Database
    console.log('Cleaning database...');
    await prisma.stockMovement.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.location.deleteMany();
    await prisma.zone.deleteMany();
    await prisma.warehouse.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('Database cleaned.');

    // 1. Create Users
    const password = await bcrypt.hash('password123', 10);

    const users = [
        { email: 'admin@wms.com', name: 'Super Admin', role: Role.ADMIN },
        { email: 'manager@wms.com', name: 'Warehouse Manager', role: Role.MANAGER },
        { email: 'staff@wms.com', name: 'John Staff', role: Role.STAFF },
        { email: 'staff2@wms.com', name: 'Jane Staff', role: Role.STAFF },
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                password,
                role: u.role,
            },
        });
        console.log(`Created user: ${u.email}`);
    }

    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@wms.com' } });

    // 2. Create Products (20 items)
    const productsData = [
        // Electronics
        { sku: 'LAP-001', name: 'Laptop Pro X1', description: 'High performance laptop', minStock: 10, price: 1500 },
        { sku: 'MON-002', name: '4K Monitor 27"', description: 'IPS Display 144Hz', minStock: 5, price: 400 },
        { sku: 'KEY-003', name: 'Mechanical Keyboard', description: 'Cherry MX Blue', minStock: 20, price: 100 },
        { sku: 'MOU-004', name: 'Wireless Mouse', description: 'Ergonomic design', minStock: 30, price: 50 },
        { sku: 'HEA-005', name: 'Noise Cancelling Headphones', description: 'Over-ear bluetooth', minStock: 15, price: 200 },
        { sku: 'TAB-006', name: 'Tablet Pro 11"', description: '128GB WiFi', minStock: 10, price: 800 },
        { sku: 'PHO-007', name: 'Smartphone Z', description: '5G Flagship', minStock: 20, price: 1000 },
        { sku: 'CAM-008', name: 'DSLR Camera', description: '24MP with Lens', minStock: 5, price: 1200 },
        { sku: 'SPE-009', name: 'Bluetooth Speaker', description: 'Waterproof portable', minStock: 25, price: 80 },
        { sku: 'PRN-010', name: 'Laser Printer', description: 'Wireless monochrome', minStock: 8, price: 250 },

        // Office
        { sku: 'CHA-011', name: 'Ergonomic Chair', description: 'Mesh back support', minStock: 10, price: 300 },
        { sku: 'DES-012', name: 'Standing Desk', description: 'Electric adjustable', minStock: 5, price: 500 },
        { sku: 'CAB-013', name: 'File Cabinet', description: '3-drawer metal', minStock: 10, price: 150 },
        { sku: 'LAM-014', name: 'Desk Lamp', description: 'LED with USB', minStock: 20, price: 40 },
        { sku: 'SHR-015', name: 'Paper Shredder', description: 'Cross-cut heavy duty', minStock: 10, price: 120 },

        // Accessories
        { sku: 'BAG-016', name: 'Laptop Backpack', description: 'Water resistant 15"', minStock: 30, price: 60 },
        { sku: 'HUB-017', name: 'USB-C Hub', description: '7-in-1 adapter', minStock: 40, price: 45 },
        { sku: 'CAB-018', name: 'HDMI Cable', description: '4K supported 2m', minStock: 50, price: 15 },
        { sku: 'STA-019', name: 'Monitor Stand', description: 'Dual arm mount', minStock: 15, price: 80 },
        { sku: 'PAD-020', name: 'Desk Mat', description: 'Large leather pad', minStock: 30, price: 25 },
    ];

    const products = [];
    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: { sku: p.sku },
            update: {},
            create: p,
        });
        products.push(product);
    }
    console.log(`Created ${products.length} products`);

    // 3. Create Warehouses (5 items)
    const warehousesData = [
        { name: 'Central Distribution', address: '123 Logistics Blvd, NY', capacity: 50000 },
        { name: 'West Coast Hub', address: '456 Harbor Dr, CA', capacity: 30000 },
        { name: 'Midwest Logistics', address: '789 Prairie Rd, IL', capacity: 25000 },
        { name: 'South Regional', address: '321 Ranch Ln, TX', capacity: 20000 },
        { name: 'East Coast Fulfillment', address: '654 Shore Ave, NJ', capacity: 40000 },
    ];

    const warehouses = [];
    for (const w of warehousesData) {
        const warehouse = await prisma.warehouse.create({
            data: {
                name: w.name,
                address: w.address,
                capacity: w.capacity,
                zones: {
                    create: [
                        {
                            name: 'Zone A (High Value)',
                            locations: {
                                create: [
                                    { code: `${w.name.substring(0, 1)}-A-01`, type: LocationType.PICKING },
                                    { code: `${w.name.substring(0, 1)}-A-02`, type: LocationType.PICKING },
                                    { code: `${w.name.substring(0, 1)}-A-03`, type: LocationType.BULK },
                                ],
                            },
                        },
                        {
                            name: 'Zone B (Standard)',
                            locations: {
                                create: [
                                    { code: `${w.name.substring(0, 1)}-B-01`, type: LocationType.PICKING },
                                    { code: `${w.name.substring(0, 1)}-B-02`, type: LocationType.PICKING },
                                    { code: `${w.name.substring(0, 1)}-B-03`, type: LocationType.RECEIVING },
                                    { code: `${w.name.substring(0, 1)}-B-04`, type: LocationType.DISPATCH },
                                ],
                            },
                        },
                    ],
                },
            },
            include: {
                zones: {
                    include: {
                        locations: true
                    }
                }
            }
        });
        warehouses.push(warehouse);
        console.log(`Created warehouse: ${warehouse.name}`);
    }

    // 4. Initial Inventory & Movements
    // Distribute stock randomly
    if (adminUser) {
        for (const warehouse of warehouses) {
            const locations = warehouse.zones.flatMap(z => z.locations).filter(l => l.type === LocationType.PICKING || l.type === LocationType.BULK);

            for (const product of products) {
                // 70% chance a product is in a warehouse
                if (Math.random() > 0.3) {
                    const location = locations[Math.floor(Math.random() * locations.length)];
                    const qty = Math.floor(Math.random() * 100) + 10;

                    await prisma.inventoryItem.create({
                        data: {
                            productId: product.id,
                            locationId: location.id,
                            quantity: qty,
                        },
                    });

                    await prisma.stockMovement.create({
                        data: {
                            type: MovementType.IN,
                            productId: product.id,
                            toLocationId: location.id,
                            quantity: qty,
                            createdById: adminUser.id,
                            referenceId: 'INIT-SEED',
                        },
                    });
                }
            }
        }
        console.log('Distributed initial inventory');
    }

    // 5. Create Orders (Mock History)
    if (adminUser) {
        const orderStatuses = [OrderStatus.COMPLETED, OrderStatus.PROCESSING, OrderStatus.PENDING, OrderStatus.DRAFT, OrderStatus.CANCELLED];

        console.log('Creating mock orders...');
        for (let i = 0; i < 15; i++) {
            try {
                const status = orderStatuses[i % orderStatuses.length];
                const itemsCount = Math.floor(Math.random() * 5) + 1;
                const orderItems = [];

                for (let j = 0; j < itemsCount; j++) {
                    const product = products[Math.floor(Math.random() * products.length)];
                    if (product) {
                        orderItems.push({
                            productId: product.id,
                            quantity: Math.floor(Math.random() * 5) + 1,
                            price: product.price
                        });
                    }
                }

                if (orderItems.length > 0) {
                    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                    await prisma.order.create({
                        data: {
                            orderNumber: `ORD-${Date.now()}-${i}`,
                            status: status,
                            totalAmount: totalAmount,
                            userId: adminUser.id,
                            items: {
                                create: orderItems
                            }
                        }
                    });
                }
            } catch (error) {
                console.error(`Failed to create order ${i}:`, error);
            }
        }
        console.log('Created mock orders');
    } else {
        console.error('Admin user not found, skipping order creation');
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

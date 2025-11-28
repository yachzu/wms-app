
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const warehouse = await prisma.warehouse.findFirst({
        where: { name: 'Test Warehouse' },
    });

    if (!warehouse) {
        console.log('Test Warehouse not found');
        return;
    }

    console.log(`Found warehouse: ${warehouse.id}`);

    try {
        // Mimic the service logic
        await prisma.$transaction(async (tx) => {
            // 1. Find all zones in this warehouse
            const zones = await tx.zone.findMany({
                where: { warehouseId: warehouse.id },
                select: { id: true },
            });
            const zoneIds = zones.map((z) => z.id);
            console.log(`Found zones: ${zoneIds.length}`);

            // 2. Delete all locations in these zones
            if (zoneIds.length > 0) {
                const deletedLocs = await tx.location.deleteMany({
                    where: { zoneId: { in: zoneIds } },
                });
                console.log(`Deleted locations: ${deletedLocs.count}`);
            }

            // 3. Delete all zones
            const deletedZones = await tx.zone.deleteMany({
                where: { warehouseId: warehouse.id },
            });
            console.log(`Deleted zones: ${deletedZones.count}`);

            // 4. Delete the warehouse
            await tx.warehouse.delete({ where: { id: warehouse.id } });
            console.log('Deleted warehouse');
        });
    } catch (e) {
        console.error('Error deleting warehouse:', e);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

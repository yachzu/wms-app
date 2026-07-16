
import { createPrismaClient } from './index';

const prisma = createPrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  const shipment1 = await prisma.shipment.create({
    data: {
      trackingId: 'TRK001',
      status: 'PENDING',
      origin: 'New York',
      destination: 'Los Angeles'
    }
  });
  
  const shipment2 = await prisma.shipment.create({
    data: {
      trackingId: 'TRK002',
      status: 'IN_TRANSIT',
      origin: 'Chicago',
      destination: 'Miami'
    }
  });
  
  console.log({ shipment1, shipment2 });
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

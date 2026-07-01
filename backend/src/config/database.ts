import { PrismaClient } from '@prisma/client';
import { applyPrismaMiddleware } from './prisma.middleware.js';

const prisma = new PrismaClient();

applyPrismaMiddleware(prisma);

prisma.$connect().then(() => {
  console.log('🗄️  Prisma Client connected');
}).catch((error) => {
  console.error('❌ Prisma Client connection error:', error);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('🗄️  Prisma Client disconnected');
  process.exit(0);
});

export default prisma;

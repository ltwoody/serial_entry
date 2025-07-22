import { prisma } from '@/lib/prisma';

export async function setReplicaIdentity(tableName: string) {
  return await prisma.$executeRawUnsafe(`ALTER TABLE ${tableName} REPLICA IDENTITY FULL;`);
}

// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@civicvoice.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@1234';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin "${email}" already exists — skipping seed.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.admin.create({ data: { email, password: hashed } });

  console.log(`✅  Admin seeded: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'darklaice@gmail.com';
  const plainPassword = 'Kenny1181';
  const role = 'ADMIN';
  const firstName = 'Kenny';
  const lastName = 'Admin';

  console.log(`Création ou mise à jour du compte administrateur pour ${email}...`);

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      firstName,
      lastName,
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      firstName,
      lastName,
      company: 'Calvino Location SAS',
    },
  });

  console.log(`✅ Compte ADMIN créé avec succès !`);
  console.log(`ID : ${user.id}`);
  console.log(`Email : ${user.email}`);
  console.log(`Rôle : ${user.role}`);
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

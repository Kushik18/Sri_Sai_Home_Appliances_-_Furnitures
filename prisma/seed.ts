import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import "dotenv/config";

const prisma = new PrismaClient()

async function main() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error("ADMIN_PASSWORD env var required for seeding")
  const passwordHash = await bcrypt.hash(password, 10)
  
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
    },
  })
  
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

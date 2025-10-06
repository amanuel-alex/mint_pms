import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "amanwithanael@gmail.com";
  const password = "aman1234";
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName: "amanuel alemayehu",
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email,
      fullName: "amanuel alemayehu",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created or updated in local DB");
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit());

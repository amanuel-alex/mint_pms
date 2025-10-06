const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("112233", 10);

  const user = await prisma.user.create({
    data: {
      fullName: "Bana Dawit",
      email: "banadawithunde@gmail.com",
      password: hashedPassword,
      // role: "PROJECT_MANAGER",
      // role: "TEAM_MEMBER",
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

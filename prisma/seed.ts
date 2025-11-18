import { prisma } from "@/lib/prisma";

async function main() {
  const tags = [
    "Sport",
    "Muzyka",
    "Edukacja",
    "Impreza",
    "Gaming",
    "Fitness",
    "Sztuka",
    "Hobby",
    "Towarzyskie"
  ];

  for (const name of tags) {
    await (prisma as any).tag.upsert({
      where: { name },
      update: {}, // nic nie zmieniamy jeśli istnieje
      create: { name },
    });
  }
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { prisma } from "@/lib/prisma";

async function main() {
  const tag = [
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

  for (const name of tag) {
    await (prisma as any).tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .then(() => console.log("Seed complete"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
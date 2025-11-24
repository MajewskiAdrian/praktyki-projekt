import { prisma } from "@/lib/prisma";

async function main() {
  // Seed Tags
  const tags = [
    "Sport",
    "Music",
    "Education",
    "Party",
    "Gaming",
    "Fitness",
    "Art",
    "Hobby",
    "Social"
  ];

  const createdTags = [];
  for (const name of tags) {
    const tag = await (prisma as any).tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdTags.push(tag);
  }
  console.log(`✅ Seeded ${createdTags.length} tags.`);
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

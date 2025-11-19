import { prisma } from "@/lib/prisma";

async function main() {
  // Seed Tags
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

  const createdTags = [];
  for (const name of tags) {
    const tag = await (prisma as any).tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdTags.push(tag);
  }

  // Seed Example User (creator of events)
  const user = await (prisma as any).user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      trueName: "Jan Kowalski",
      bio: "Organizator lokalnych wydarzen",
    },
  });

  // Seed Events
  const events = [
    {
      title: "Turniej pilki noznej",
      description: "Zapraszamy na turniej pilki noznej dla amatorow. Gra fair play, dobra zabawa!",
      latitude: 52.2297,
      longitude: 21.0122,
      eventDate: new Date("2025-11-25T15:00:00Z"),
      maxAttendees: 22,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[0].id }] } // Sport
    },
    {
      title: "Koncert jazzowy w klubie",
      description: "Wieczor z muzyka jazzowa. Wystapi lokalna kapela. Wstep wolny.",
      latitude: 52.2319,
      longitude: 21.0067,
      eventDate: new Date("2025-11-22T19:00:00Z"),
      maxAttendees: 50,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[1].id }] } // Muzyka
    },
    {
      title: "Warsztaty fotografii cyfrowej",
      description: "Naucz sie podstaw fotografii cyfrowej. Prosimy przyniesc swoj aparat.",
      latitude: 52.2356,
      longitude: 21.0134,
      eventDate: new Date("2025-11-28T10:00:00Z"),
      maxAttendees: 15,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[2].id }, { id: createdTags[6].id }] } // Edukacja, Sztuka
    },
    {
      title: "Spotkanie graczy planszowych",
      description: "Wieczor gier planszowych. Przyjdz i poznaj nowych ludzi przy grze w Catan, Dixit i inne.",
      latitude: 52.2289,
      longitude: 21.0089,
      eventDate: new Date("2025-11-23T18:00:00Z"),
      maxAttendees: 20,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[4].id }, { id: createdTags[8].id }] } // Gaming, Towarzyskie
    },
    {
      title: "Trening biegowy w parku",
      description: "Poranny trening biegowy dla poczatkujacych i zaawansowanych. Trasa 5km.",
      latitude: 52.2167,
      longitude: 21.0333,
      eventDate: new Date("2025-11-24T07:00:00Z"),
      maxAttendees: 30,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[5].id }, { id: createdTags[0].id }] } // Fitness, Sport
    },
    {
      title: "Festiwal ulicznego jedzenia",
      description: "Sprobuj potraw z roznych krajow. Food trucki, muzyka na zywo, dobra atmosfera.",
      latitude: 52.2400,
      longitude: 21.0190,
      eventDate: new Date("2025-11-30T12:00:00Z"),
      maxAttendees: null,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[3].id }, { id: createdTags[8].id }] } // Impreza, Towarzyskie
    }
  ];

  for (const eventData of events) {
    await (prisma as any).event.create({
      data: eventData,
    });
  }

  console.log(`Created ${events.length} events`);
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

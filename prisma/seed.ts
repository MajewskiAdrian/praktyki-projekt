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

  // Seed Events (Trójmiasto, 10 events)
  const events = [
    {
      title: "Turniej piłki nożnej",
      description: "Lokalny turniej piłkarski — drużyny amatorskie, dobra zabawa i fair play.",
      latitude: 54.4419,
      longitude: 18.5600,
      eventDate: new Date("2025-11-25T15:00:00Z"),
      maxAttendees: 22,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[0].id }] } // Sport
    },
    {
      title: "Koncert jazzowy",
      description: "Wieczór jazzu z lokalnymi muzykami — kameralna atmosfera, wstęp wolny.",
      latitude: 54.3520,
      longitude: 18.6466,
      eventDate: new Date("2025-11-22T19:00:00Z"),
      maxAttendees: 50,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[1].id }] } // Muzyka
    },
    {
      title: "Warsztaty fotografii",
      description: "Praktyczne warsztaty fotografii miejskiej i portretu. Przydadzą się aparaty i smartfony.",
      latitude: 54.5189,
      longitude: 18.5311,
      eventDate: new Date("2025-11-28T10:00:00Z"),
      maxAttendees: 15,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[2].id }, { id: createdTags[6].id }] } // Edukacja, Sztuka
    },
    {
      title: "Spotkanie graczy planszowych",
      description: "Wieczór gier planszowych — Catan, Dixit i inne tytuły. Przyjdź sam lub z grupą.",
      latitude: 54.3782,
      longitude: 18.6206,
      eventDate: new Date("2025-11-23T18:00:00Z"),
      maxAttendees: 20,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[4].id }, { id: createdTags[8].id }] } // Gaming, Towarzyskie
    },
    {
      title: "Trening biegowy",
      description: "Poranny trening biegowy — trasa ok. 5 km, podział na grupy początkujące i zaawansowane.",
      latitude: 54.4010,
      longitude: 18.5606,
      eventDate: new Date("2025-11-24T07:00:00Z"),
      maxAttendees: 30,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[5].id }, { id: createdTags[0].id }] } // Fitness, Sport
    },
    {
      title: "Festiwal ulicznego jedzenia",
      description: "Food trucki, strefy degustacji i muzyka na żywo — smaki z całego świata.",
      latitude: 54.5186,
      longitude: 18.5304,
      eventDate: new Date("2025-11-30T12:00:00Z"),
      maxAttendees: null,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[3].id }, { id: createdTags[8].id }] } // Impreza, Towarzyskie
    },
    {
      title: "Plener malarski",
      description: "Wspólne malowanie na świeżym powietrzu — materiały we własnym zakresie, krótka instrukcja.",
      latitude: 54.3601,
      longitude: 18.6416,
      eventDate: new Date("2025-12-02T11:00:00Z"),
      maxAttendees: 25,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[6].id }, { id: createdTags[7].id }] } // Sztuka, Hobby
    },
    {
      title: "Nocny bieg rekreacyjny",
      description: "Krótki nocny bieg miejski — reflektory i bezpieczne tempo, po biegu rozciąganie.",
      latitude: 54.4414,
      longitude: 18.5664,
      eventDate: new Date("2025-11-27T20:00:00Z"),
      maxAttendees: 40,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[5].id }] } // Fitness
    },
    {
      title: "Jam session dla lokalnych muzyków",
      description: "Otwarte jam session — przynieś instrument i dołącz do improwizacji, scena i sprzęt podstawowy dostępny.",
      latitude: 54.5180,
      longitude: 18.5300,
      eventDate: new Date("2025-12-05T19:30:00Z"),
      maxAttendees: 30,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[1].id }] } // Muzyka
    },
    {
      title: "Wymiana książek i kawa",
      description: "Spotkanie miłośników czytania — przynieś książkę, wymień się i porozmawiaj przy kawie.",
      latitude: 54.4039,
      longitude: 18.5847,
      eventDate: new Date("2025-12-07T14:00:00Z"),
      maxAttendees: 60,
      creatorId: user.id,
      tags: { connect: [{ id: createdTags[7].id }, { id: createdTags[2].id }] } // Hobby, Edukacja
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

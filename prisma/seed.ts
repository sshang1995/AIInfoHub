import "dotenv/config";
import { PrismaClient, SourceType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { TOPICS, INITIAL_SOURCES, TOPIC_COLORS } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding topics...");
  for (const topic of TOPICS) {
    await db.topic.upsert({
      where: { slug: topic.slug },
      update: { nameZh: topic.nameZh, color: TOPIC_COLORS[topic.slug] ?? "#15803D" },
      create: {
        name: topic.name,
        nameZh: topic.nameZh,
        slug: topic.slug,
        color: TOPIC_COLORS[topic.slug] ?? "#15803D",
      },
    });
  }
  console.log(`Seeded ${TOPICS.length} topics.`);

  console.log("Seeding sources...");
  for (const source of INITIAL_SOURCES) {
    await db.source.upsert({
      where: { slug: source.slug },
      update: { active: true },
      create: {
        name: source.name,
        slug: source.slug,
        sourceType: source.sourceType as SourceType,
        url: source.url,
        rssUrl: "rssUrl" in source ? source.rssUrl : null,
        category: source.category,
        authorityScore: 0.8,
        active: true,
      },
    });
  }
  console.log(`Seeded ${INITIAL_SOURCES.length} sources.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

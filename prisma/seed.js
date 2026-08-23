const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding default government website content intelligence source and categories...");

  // Default Source
  let source = await prisma.source.findFirst();
  if (!source) {
    source = await prisma.source.create({
      data: {
        name: "Sarkari Result / Gov Job Portal",
        baseUrl: "https://sarkariresult.com",
        homepageUrl: "https://sarkariresult.com",
        enabled: true,
        scrapeConfig: JSON.stringify({
          allowedDomains: ["sarkariresult.com"],
          requestDelayMs: 400,
        }),
      },
    });
    console.log(`Created Source: ${source.name} (${source.id})`);
  }

  // Default Categories based on PRD Section 7 & 6
  const categories = [
    {
      name: "Latest Jobs",
      slug: "latest-jobs",
      sourceUrl: "https://sarkariresult.com/latestjob/",
      priority: 1,
      keywords: "recruitment,vacancy,online form,apply online,bharti,भर्ती,job,officer,apprentice,post",
    },
    {
      name: "Admit Card",
      slug: "admit-card",
      sourceUrl: "https://sarkariresult.com/admitcard/",
      priority: 2,
      keywords: "admit card,hall ticket,call letter,प्रवेश पत्र,exam city,admit-card",
    },
    {
      name: "Result",
      slug: "result",
      sourceUrl: "https://sarkariresult.com/result/",
      priority: 3,
      keywords: "result,score card,scorecard,merit list,cut off,cutoff,selection list,परिणाम,marks",
    },
    {
      name: "Answer Key",
      slug: "answer-key",
      sourceUrl: "https://sarkariresult.com/answerkey/",
      priority: 4,
      keywords: "answer key,response sheet,answer sheet,key objection,उत्तर कुंजी",
    },
    {
      name: "Syllabus",
      slug: "syllabus",
      sourceUrl: "https://sarkariresult.com/syllabus/",
      priority: 5,
      keywords: "syllabus,exam pattern,curriculum,पाठ्यक्रम",
    },
    {
      name: "Admission",
      slug: "admission",
      sourceUrl: "https://sarkariresult.com/admission/",
      priority: 6,
      keywords: "admission,entrance exam,counselling,counseling,allotment,प्रवेश",
    },
    {
      name: "Other",
      slug: "other",
      sourceUrl: "https://sarkariresult.com/",
      priority: 99,
      keywords: "certificate,verification,important",
    },
  ];

  for (const cat of categories) {
    const existing = await prisma.category.findFirst({
      where: { sourceId: source.id, slug: cat.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          sourceId: source.id,
          name: cat.name,
          slug: cat.slug,
          sourceUrl: cat.sourceUrl,
          priority: cat.priority,
          keywords: cat.keywords,
          enabled: true,
        },
      });
      console.log(`Created category: ${cat.name}`);
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function makeToken(len = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

const count = Number(process.env.SEED_TOKENS || 20);

const run = async () => {
  const existing = await prisma.token.count();
  if (existing > 0) {
    console.log(`Tokens already exist (${existing}). Skipping.`);
    return;
  }

  const tokens = Array.from({ length: count }, () => ({ token: makeToken() }));
  await prisma.token.createMany({ data: tokens });

  console.log("Created tokens:");
  tokens.forEach(t => console.log(t.token));
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

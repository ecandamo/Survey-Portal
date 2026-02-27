import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getTokenValue() {
  const argToken = process.argv[2]?.trim();
  if (argToken) return argToken;

  const configToken = process.env.npm_config_token?.trim();
  if (configToken) return configToken;

  const rawArgv = process.env.npm_config_argv;
  if (!rawArgv) return "";

  try {
    const parsed = JSON.parse(rawArgv);
    const original = Array.isArray(parsed?.original) ? parsed.original : [];
    const scriptIndex = original.indexOf("reset-token");
    if (scriptIndex === -1) return "";

    return original
      .slice(scriptIndex + 1)
      .find((value) => value && value !== "--")
      ?.trim() || "";
  } catch {
    return "";
  }
}

const tokenValue = getTokenValue();

if (!tokenValue) {
  console.error("Usage: npm run reset-token -- TOKEN");
  console.error("Also supported: npm run reset-token TOKEN");
  process.exit(1);
}

const run = async () => {
  const token = await prisma.token.findUnique({
    where: { token: tokenValue },
    include: { response: true }
  });

  if (!token) {
    console.error(`Token not found: ${tokenValue}`);
    process.exit(1);
  }

  await prisma.$transaction(async (tx) => {
    if (token.response) {
      await tx.response.delete({
        where: { tokenId: token.id }
      });
    }

    await tx.token.update({
      where: { id: token.id },
      data: { usedAt: null }
    });
  });

  const resetSummary = token.response ? "response deleted and token reset" : "token reset";
  console.log(`${tokenValue}: ${resetSummary}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

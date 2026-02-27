-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "overallValue" INTEGER NOT NULL,
    "pipelineValue" INTEGER NOT NULL,
    "huddleValue" INTEGER NOT NULL,
    "timeInvestment" TEXT NOT NULL,
    "pipelineChanges" TEXT[],
    "pipelineOther" TEXT,
    "huddleChanges" TEXT[],
    "huddleOther" TEXT,
    "meetingTiming" TEXT NOT NULL,
    "improveOneThing" TEXT,
    "anythingElse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Response_tokenId_key" ON "Response"("tokenId");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

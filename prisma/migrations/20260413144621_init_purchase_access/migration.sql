-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "BuyerAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessTokenHash" TEXT,
    "tokenIssuedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntent" TEXT,
    "stripeCustomerId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "amountTotal" INTEGER,
    "currency" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "buyerAccessId" TEXT NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BuyerAccess_email_key" ON "BuyerAccess"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerAccess_accessTokenHash_key" ON "BuyerAccess"("accessTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_stripeSessionId_key" ON "Purchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Purchase_buyerAccessId_paidAt_idx" ON "Purchase"("buyerAccessId", "paidAt");

-- CreateIndex
CREATE INDEX "Purchase_customerEmail_paidAt_idx" ON "Purchase"("customerEmail", "paidAt");

-- CreateIndex
CREATE INDEX "Purchase_productSlug_idx" ON "Purchase"("productSlug");

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_buyerAccessId_fkey" FOREIGN KEY ("buyerAccessId") REFERENCES "BuyerAccess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

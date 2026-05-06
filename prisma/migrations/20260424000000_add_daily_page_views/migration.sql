-- CreateTable
CREATE TABLE "DailyPageView" (
    "id" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "scopeKey" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "productSlug" TEXT,
    "productCategory" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyPageView_dateKey_pageKey_scopeKey_key" ON "DailyPageView"("dateKey", "pageKey", "scopeKey");

-- CreateIndex
CREATE INDEX "DailyPageView_dateKey_pageKey_idx" ON "DailyPageView"("dateKey", "pageKey");

-- CreateIndex
CREATE INDEX "DailyPageView_pageKey_productCategory_dateKey_idx" ON "DailyPageView"("pageKey", "productCategory", "dateKey");

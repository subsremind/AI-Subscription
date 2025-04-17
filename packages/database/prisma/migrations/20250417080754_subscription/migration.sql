/*
  Warnings:

  - You are about to drop the column `contract_expiry` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `next_payment_date` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `url_link` on the `subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the `_SubscriptionToTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentMethod` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlLink` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SubscriptionToTag" DROP CONSTRAINT "_SubscriptionToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubscriptionToTag" DROP CONSTRAINT "_SubscriptionToTag_B_fkey";

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "contract_expiry",
DROP COLUMN "next_payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "url_link",
ADD COLUMN     "contractExpiry" TIMESTAMP(3),
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" VARCHAR(30) NOT NULL,
ADD COLUMN     "urlLink" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "_SubscriptionToTag";

-- CreateTable
CREATE TABLE "subscription_tag" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SubscriptionTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubscriptionTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_tag_subscriptionId_tagId_key" ON "subscription_tag"("subscriptionId", "tagId");

-- CreateIndex
CREATE INDEX "_SubscriptionTags_B_index" ON "_SubscriptionTags"("B");

-- AddForeignKey
ALTER TABLE "subscription_tag" ADD CONSTRAINT "subscription_tag_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_tag" ADD CONSTRAINT "subscription_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionTags" ADD CONSTRAINT "_SubscriptionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubscriptionTags" ADD CONSTRAINT "_SubscriptionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

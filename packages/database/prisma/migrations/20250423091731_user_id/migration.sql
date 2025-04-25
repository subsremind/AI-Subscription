/*
  Warnings:

  - You are about to drop the column `notes_included` on the `subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "category" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "notes_included",
ADD COLUMN     "notesIncluded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "paymentMethod" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

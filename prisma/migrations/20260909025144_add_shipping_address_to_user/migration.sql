-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shippingAddress" TEXT,
ALTER COLUMN "groupId" DROP NOT NULL;

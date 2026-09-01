-- AlterTable
ALTER TABLE "Watch" ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

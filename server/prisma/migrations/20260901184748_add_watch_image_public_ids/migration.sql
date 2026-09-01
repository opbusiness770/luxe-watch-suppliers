-- AlterTable
ALTER TABLE "Watch" ADD COLUMN     "imagePublicIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

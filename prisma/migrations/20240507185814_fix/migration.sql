/*
  Warnings:

  - You are about to drop the column `hideen` on the `Meal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meal" DROP COLUMN "hideen",
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

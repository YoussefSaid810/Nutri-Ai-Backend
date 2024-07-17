-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "GOAL" AS ENUM ('MUSCLEGAIN', 'WEIGHTLOSS', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Activity" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'HEAVY', 'ATHLETE');

-- CreateEnum
CREATE TYPE "Diet" AS ENUM ('VEGETARIAN', 'VEGAN', 'GLUTENFREE', 'DAIRYFREE', 'LOWFODMAP', 'KETOGENIC', 'WHOLE30');

-- CreateEnum
CREATE TYPE "Dish" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACK', 'SIDE_DISH', 'SOUP', 'SAUCE');

-- CreateTable
CREATE TABLE "Verification_Emails" (
    "id" TEXT NOT NULL,
    "sent_at" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL DEFAULT '',
    "count" INTEGER NOT NULL DEFAULT 0,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Verification_Emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "passwordChangedAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Infos" (
    "id" TEXT NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "height" DOUBLE PRECISION NOT NULL DEFAULT 170,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "age" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "activity" "Activity" NOT NULL DEFAULT 'SEDENTARY',
    "goal" "GOAL" NOT NULL DEFAULT 'MAINTAIN',
    "userID" TEXT NOT NULL,

    CONSTRAINT "User_Infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealRates" (
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "rateMessage" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "MealRates_pkey" PRIMARY KEY ("userId","mealId")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "measure" TEXT NOT NULL DEFAULT 'gram',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calories" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fats" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentFat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "protein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentProtein" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuisines" TEXT NOT NULL DEFAULT '',
    "sourceURL" TEXT NOT NULL DEFAULT '',
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 50,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietType" (
    "id" SERIAL NOT NULL,
    "type" "Diet" NOT NULL,
    "mealID" TEXT NOT NULL,

    CONSTRAINT "DietType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DishType" (
    "id" SERIAL NOT NULL,
    "type" "Dish" NOT NULL,
    "mealID" TEXT NOT NULL,

    CONSTRAINT "DishType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_Daily_Plans" (
    "userID" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Daily_Plans_pkey" PRIMARY KEY ("userID","plan")
);

-- CreateTable
CREATE TABLE "User_Preferences" (
    "userID" TEXT NOT NULL,
    "mealID" TEXT NOT NULL,

    CONSTRAINT "User_Preferences_pkey" PRIMARY KEY ("userID","mealID")
);

-- CreateTable
CREATE TABLE "MealIngredients" (
    "mealID" TEXT NOT NULL,
    "ingerID" TEXT NOT NULL,

    CONSTRAINT "MealIngredients_pkey" PRIMARY KEY ("mealID","ingerID")
);

-- CreateTable
CREATE TABLE "Ingredients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DietType_type_mealID_key" ON "DietType"("type", "mealID");

-- CreateIndex
CREATE UNIQUE INDEX "DishType_type_mealID_key" ON "DishType"("type", "mealID");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredients_name_key" ON "Ingredients"("name");

-- AddForeignKey
ALTER TABLE "Verification_Emails" ADD CONSTRAINT "Verification_Emails_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Infos" ADD CONSTRAINT "User_Infos_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRates" ADD CONSTRAINT "MealRates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRates" ADD CONSTRAINT "MealRates_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietType" ADD CONSTRAINT "DietType_mealID_fkey" FOREIGN KEY ("mealID") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DishType" ADD CONSTRAINT "DishType_mealID_fkey" FOREIGN KEY ("mealID") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Daily_Plans" ADD CONSTRAINT "User_Daily_Plans_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Preferences" ADD CONSTRAINT "User_Preferences_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Preferences" ADD CONSTRAINT "User_Preferences_mealID_fkey" FOREIGN KEY ("mealID") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredients" ADD CONSTRAINT "MealIngredients_mealID_fkey" FOREIGN KEY ("mealID") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredients" ADD CONSTRAINT "MealIngredients_ingerID_fkey" FOREIGN KEY ("ingerID") REFERENCES "Ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migration: Update Settings table with material-based pricing
-- Run this in your Supabase SQL Editor

-- Create Settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Settings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "priceWool" DOUBLE PRECISION NOT NULL DEFAULT 27.0,
  "priceSilk" DOUBLE PRECISION NOT NULL DEFAULT 47.0,
  "priceCotton" DOUBLE PRECISION NOT NULL DEFAULT 24.0,
  "priceSynthetic" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
  "priceOther" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
  "repairHourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
  "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 7.7,
  "currency" TEXT NOT NULL DEFAULT 'CHF',
  "emailFrom" TEXT,
  "emailHost" TEXT,
  "emailPort" INTEGER,
  "emailUser" TEXT,
  "emailPassword" TEXT,
  "emailSecure" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- Insert default settings
INSERT INTO "Settings" (
  "id", 
  "createdAt", 
  "updatedAt", 
  "priceWool", 
  "priceSilk", 
  "priceCotton", 
  "priceSynthetic", 
  "priceOther", 
  "repairHourlyRate", 
  "taxRate", 
  "currency",
  "emailSecure"
)
VALUES (
  'default',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  27.0,
  47.0,
  24.0,
  20.0,
  30.0,
  50.0,
  7.7,
  'CHF',
  true
)
ON CONFLICT ("id") DO UPDATE SET
  "priceWool" = EXCLUDED."priceWool",
  "priceSilk" = EXCLUDED."priceSilk",
  "priceCotton" = EXCLUDED."priceCotton",
  "priceSynthetic" = EXCLUDED."priceSynthetic",
  "priceOther" = EXCLUDED."priceOther",
  "updatedAt" = CURRENT_TIMESTAMP;

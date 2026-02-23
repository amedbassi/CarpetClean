-- Create Client table
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "street" TEXT,
    "number" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email (only for non-null values)
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email") WHERE "email" IS NOT NULL AND "email" != '';

-- Create indexes for searching
CREATE INDEX "Client_name_idx" ON "Client"("name");
CREATE INDEX "Client_email_idx" ON "Client"("email");
CREATE INDEX "Client_phone_idx" ON "Client"("phone");

-- Add clientId to Order table
ALTER TABLE "Order" ADD COLUMN "clientId" TEXT;

-- Add new approval columns
ALTER TABLE "Order" ADD COLUMN "requiresCleaningApproval" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "cleaningApprovalStatus" TEXT NOT NULL DEFAULT 'not_needed';
ALTER TABLE "Order" ADD COLUMN "requiresRepairApproval" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN "repairApprovalStatus" TEXT NOT NULL DEFAULT 'not_needed';

-- Migrate existing data: Create clients from existing orders
INSERT INTO "Client" ("id", "name", "phone", "email", "createdAt", "updatedAt")
SELECT 
    'client_' || "clientName" || '_' || ROW_NUMBER() OVER (PARTITION BY "clientName" ORDER BY MIN("createdAt")) as id,
    "clientName" as name,
    NULLIF(MAX("phone"), '') as phone,
    NULLIF(MAX("email"), '') as email,
    MIN("createdAt") as "createdAt",
    NOW() as "updatedAt"
FROM "Order"
GROUP BY "clientName";

-- Update orders with clientId (match by client name)
UPDATE "Order" o
SET "clientId" = (
    SELECT c."id" 
    FROM "Client" c 
    WHERE c."name" = o."clientName" 
    LIMIT 1
);

-- Create foreign key constraint
ALTER TABLE "Order" 
ADD CONSTRAINT "Order_clientId_fkey" 
FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Make clientId NOT NULL after data migration
ALTER TABLE "Order" ALTER COLUMN "clientId" SET NOT NULL;

-- Create index on clientId
CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

-- Drop old columns from Order table
ALTER TABLE "Order" DROP COLUMN "clientName";
ALTER TABLE "Order" DROP COLUMN "phone";
ALTER TABLE "Order" DROP COLUMN "email";
ALTER TABLE "Order" DROP COLUMN "address";
ALTER TABLE "Order" DROP COLUMN "requiresApproval";
ALTER TABLE "Order" DROP COLUMN "approvalStatus";

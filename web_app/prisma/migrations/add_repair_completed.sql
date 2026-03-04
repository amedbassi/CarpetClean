-- Add repairCompleted field to CarpetItem
ALTER TABLE "CarpetItem" 
ADD COLUMN "repairCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Add index for performance
CREATE INDEX "CarpetItem_repairCompleted_idx" ON "CarpetItem"("repairCompleted");

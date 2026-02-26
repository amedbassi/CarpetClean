-- Cleanup Invalid Status Values
-- This script checks for and fixes any invalid status values in the CarpetItem table
-- Valid statuses: pending, measured, ready_for_delivery, delivered

-- First, let's see what statuses currently exist
-- Run this query first to check:
-- SELECT DISTINCT status FROM "CarpetItem";

-- Update any 'cleaning' status to 'measured' (assuming they're being cleaned)
UPDATE "CarpetItem"
SET status = 'measured'
WHERE status = 'cleaning';

-- Update any 'cleaned' status to 'ready_for_delivery' (assuming cleaning is complete)
UPDATE "CarpetItem"
SET status = 'ready_for_delivery'
WHERE status = 'cleaned';

-- Check for any other invalid statuses (anything not in the valid list)
-- Run this to see if there are any other unexpected values:
-- SELECT DISTINCT status FROM "CarpetItem" 
-- WHERE status NOT IN ('pending', 'measured', 'ready_for_delivery', 'delivered');

-- Optional: Add a check constraint to prevent invalid statuses in the future
-- (Uncomment if you want to enforce valid statuses at the database level)
-- ALTER TABLE "CarpetItem"
-- ADD CONSTRAINT valid_status_check 
-- CHECK (status IN ('pending', 'measured', 'ready_for_delivery', 'delivered'));

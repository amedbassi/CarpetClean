-- Clear Database Script
-- Run this in Supabase SQL Editor to delete all data and start fresh

-- Delete in correct order due to foreign key constraints

-- 1. Delete all carpet items
DELETE FROM "CarpetItem";

-- 2. Delete all orders
DELETE FROM "Order";

-- 3. Delete all clients
DELETE FROM "Client";

-- Verify deletion
SELECT 'CarpetItems' as table_name, COUNT(*) as remaining_rows FROM "CarpetItem"
UNION ALL
SELECT 'Orders' as table_name, COUNT(*) as remaining_rows FROM "Order"
UNION ALL
SELECT 'Clients' as table_name, COUNT(*) as remaining_rows FROM "Client";

-- Expected result: All counts should be 0

-- Fix Mixed Delivery Statuses
-- This script fixes orders where some items are marked as 'delivered' while others are not
-- All items in an order should have the same delivery status

-- Step 1: Find orders with mixed delivery statuses
-- Run this first to see which orders are affected:
/*
SELECT 
    "orderId",
    COUNT(*) as total_items,
    SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_items,
    SUM(CASE WHEN status != 'delivered' THEN 1 ELSE 0 END) as not_delivered_items
FROM "CarpetItem"
GROUP BY "orderId"
HAVING SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) > 0 
   AND SUM(CASE WHEN status != 'delivered' THEN 1 ELSE 0 END) > 0
ORDER BY "orderId";
*/

-- Step 2: Fix orders where SOME items are delivered
-- Option A: If the order has a deliverySignature, mark ALL items as delivered
UPDATE "CarpetItem"
SET status = 'delivered'
WHERE "orderId" IN (
    SELECT o.id 
    FROM "Order" o
    WHERE o."deliverySignature" IS NOT NULL
)
AND status != 'delivered';

-- Option B: If the order has NO deliverySignature but some items are marked delivered,
-- reset those items to 'ready_for_delivery' (they shouldn't be delivered without signature)
UPDATE "CarpetItem"
SET status = 'ready_for_delivery'
WHERE "orderId" IN (
    SELECT o.id 
    FROM "Order" o
    WHERE o."deliverySignature" IS NULL
)
AND status = 'delivered';

-- Step 3: Verify the fix
-- Run this to confirm all orders now have consistent statuses:
/*
SELECT 
    "orderId",
    COUNT(*) as total_items,
    STRING_AGG(DISTINCT status, ', ') as statuses
FROM "CarpetItem"
GROUP BY "orderId"
ORDER BY "orderId";
*/

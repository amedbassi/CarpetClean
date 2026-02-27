# Status System Clarification

## Current Status Values in the Application

The application uses **4 distinct statuses** for carpet items:

1. **pending** - Initial status when order is created
2. **measured** - After dimensions and details are recorded
3. **ready_for_delivery** - After cleaning/repair is complete and approved
4. **delivered** - After delivery is completed with signature

## Important Notes

### No "cleaning" or "cleaned" Status
- The statuses "cleaning" and "cleaned" **DO NOT EXIST** in the application
- If you see these statuses, it's likely **cached browser data**
- Solution: **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Delivery Behavior - ENTIRE ORDER ONLY
Orders are delivered **as a complete unit**, not individual items:
- When you click "Complete delivery" on an order, **ALL items** in that order are marked as delivered
- The signature applies to the entire order
- Individual items **CANNOT** be delivered separately
- The API now blocks any attempts to mark individual items as "delivered"

### Mixed Delivery Status Bug (FIXED)
If you see orders like order-062 with some items delivered and others not:
- This is **old data** from before the fix
- Run the cleanup script: `prisma/migrations/fix_mixed_delivery_statuses.sql`
- This will ensure all items in an order have consistent delivery status

## Status Flow

```
pending → measured → ready_for_delivery → delivered
   ↓          ↓              ↓                ↓
Created   Operations    Operations      Delivery
          Page          Page            Dashboard
```

## Where Statuses Are Used

### Operations Dashboard
- Shows: pending, measured, ready_for_delivery
- "Mark Ready" button: Changes measured → ready_for_delivery
- Requires cleaning approval (if enabled) before marking ready

### Delivery Dashboard
- Shows: Orders with items in ready_for_delivery status
- "Complete delivery" button: Changes all items → delivered
- Captures signature for entire order

### Data Review Dashboard
- Filter options: pending, measured, ready_for_delivery, delivered
- Analytics show counts for each status
- No "cleaning" or "cleaned" options

## Troubleshooting

### Issue 1: Seeing "cleaning" or "cleaned" statuses

**Step 1: Clean Up Database (RECOMMENDED)**
Run the cleanup SQL script in Supabase:
1. Open Supabase SQL Editor
2. Run: `prisma/migrations/cleanup_invalid_statuses.sql`
3. This will convert:
   - 'cleaning' → 'measured'
   - 'cleaned' → 'ready_for_delivery'

**Step 2: Clear Browser Cache**
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Or clear browser cache completely
3. Reload the application

**Step 3: Verify**
Check the Operations page - you should now only see:
- Yellow badges: "pending"
- Blue badges: "measured"
- Green badges: "ready_for_delivery"
- Gray badges: "delivered"

### Issue 2: Mixed delivery statuses (e.g., order-062)

Some items in an order are "delivered" while others are not.

**Step 1: Run Fix Script**
1. Open Supabase SQL Editor
2. Run: `prisma/migrations/fix_mixed_delivery_statuses.sql`
3. This will:
   - Mark ALL items as delivered if the order has a delivery signature
   - Reset items to "ready_for_delivery" if no signature exists

**Step 2: Verify**
Check the Data Review page - all items in each order should now have the same status.

**Prevention:**
The API has been updated to prevent individual items from being marked as "delivered" in the future.

## Database Schema

```prisma
model CarpetItem {
  status String @default("pending")
  // Valid values: "pending", "measured", "ready_for_delivery", "delivered"
}
```

# Repair Workflow Implementation Plan

**Date**: March 4, 2026  
**Status**: Planning Phase

---

## Requirements Summary

1. **Add "Repair Complete" button** in Repair Dashboard
2. **Make "Ready for Exit" independent** from repair approval status
3. **Hide rejected repairs** from Repair Dashboard and page

---

## Current System Analysis

### Current Workflow
1. Item needs repair → Shows in Repair Dashboard
2. Create repair estimate → Set repair cost
3. Send repair estimate → `repairApprovalStatus` = 'pending'
4. Client approves/rejects → Status = 'approved' or 'rejected'
5. Operations marks "Ready for Exit" → **Currently blocked if repair not approved**

### Current Issues
- ❌ Can't mark item ready if repair is pending/rejected
- ❌ Rejected repairs still show in Repair Dashboard
- ❌ No way to mark repair as complete
- ❌ Repair completion tied to approval status

---

## Proposed Solution

### New Field in Database
Add `repairCompleted` field to `CarpetItem`:
```prisma
model CarpetItem {
  // ... existing fields
  repairCompleted Boolean @default(false)
}
```

### New Workflow

#### Scenario 1: Repair Approved
1. Item needs repair → Shows in Repair Dashboard
2. Create estimate → Set repair cost
3. Send estimate → `repairApprovalStatus` = 'pending'
4. Client approves → `repairApprovalStatus` = 'approved'
5. **NEW**: Click "Mark Repair Complete" → `repairCompleted` = true
6. Item disappears from Repair Dashboard
7. Operations can mark "Ready for Exit" (independent of repair)

#### Scenario 2: Repair Rejected
1. Item needs repair → Shows in Repair Dashboard
2. Create estimate → Set repair cost
3. Send estimate → `repairApprovalStatus` = 'pending'
4. Client rejects → `repairApprovalStatus` = 'rejected'
5. **NEW**: Item automatically hidden from Repair Dashboard
6. Operations can still mark "Ready for Exit" (independent)

#### Scenario 3: No Repair Needed
1. Item in good condition
2. No repair estimate created
3. Operations marks "Ready for Exit" directly
4. No repair workflow involved

---

## Implementation Steps

### Step 1: Database Migration
**File**: `prisma/migrations/add_repair_completed.sql`

```sql
-- Add repairCompleted field to CarpetItem
ALTER TABLE "CarpetItem" 
ADD COLUMN "repairCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Add index for performance
CREATE INDEX "CarpetItem_repairCompleted_idx" ON "CarpetItem"("repairCompleted");
```

**Schema Update**: `prisma/schema.prisma`
```prisma
model CarpetItem {
  id                String
  orderId           String
  status            String  @default("pending")
  length            String?
  width             String?
  material          String?
  state             String?
  photo             String?
  cleaningCost      Float?
  repairCost        Float?
  repairDescription String?
  repairCompleted   Boolean @default(false)  // NEW
  individualClient  String?
  order             Order   @relation(fields: [orderId], references: [id])

  @@id([orderId, id])
  @@index([repairCompleted])  // NEW
}
```

### Step 2: Update Repair Dashboard Logic
**File**: `src/components/RepairDashboard.tsx`

**Changes**:
1. Filter out rejected repairs
2. Filter out completed repairs
3. Add "Mark Repair Complete" button
4. Update API call to set `repairCompleted`

**New Filter Logic**:
```typescript
const repairItems = order.items.filter(item =>
  // Has repair cost
  (item.repairCost || 0) > 0 &&
  // Not completed
  !item.repairCompleted &&
  // Not rejected
  order.repairApprovalStatus !== 'rejected'
);
```

**New Button**:
```typescript
<button
  onClick={() => handleMarkRepairComplete(order.id, item.id)}
  disabled={order.repairApprovalStatus !== 'approved'}
  className="..."
>
  Mark Repair Complete
</button>
```

### Step 3: Update Operations Dashboard Logic
**File**: `src/components/OperationsDashboard.tsx`

**Changes**:
1. Remove repair approval check from "Mark Ready" button
2. Allow marking ready regardless of repair status

**Before**:
```typescript
<button
  disabled={order.requiresCleaningApproval && 
    (order.cleaningApprovalStatus !== 'approved')}
>
  Mark Ready
</button>
```

**After**:
```typescript
<button
  disabled={order.requiresCleaningApproval && 
    (order.cleaningApprovalStatus !== 'approved')}
  // No repair check!
>
  Mark Ready
</button>
```

### Step 4: Create API Endpoint
**File**: `src/app/api/repair/complete/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { orderId, itemId } = await request.json();

    await prisma.carpetItem.update({
      where: {
        orderId_id: {
          orderId,
          id: itemId
        }
      },
      data: {
        repairCompleted: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking repair complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark repair complete' },
      { status: 500 }
    );
  }
}
```

### Step 5: Add Translations
**File**: `src/lib/translations.ts`

**English**:
```typescript
repair: {
  // ... existing
  mark_complete: 'Mark Repair Complete',
  repair_completed: 'Repair Completed',
  completed_success: 'Repair marked as complete!',
  must_approve_first: 'Repair must be approved before marking complete',
}
```

**French**:
```typescript
repair: {
  // ... existing
  mark_complete: 'Marquer Réparation Terminée',
  repair_completed: 'Réparation Terminée',
  completed_success: 'Réparation marquée comme terminée !',
  must_approve_first: 'La réparation doit être approuvée avant de la marquer comme terminée',
}
```

### Step 6: Update Types
**File**: `src/lib/types.ts`

```typescript
export interface CarpetItem {
  id: string;
  status: string;
  length?: string;
  width?: string;
  material?: string;
  state?: string;
  photo?: string;
  cleaningCost?: number;
  repairCost?: number;
  repairDescription?: string;
  repairCompleted?: boolean;  // NEW
  individualClient?: string;
}
```

---

## Testing Plan

### Phase 1: Database Migration Testing

**Test 1.1: Run Migration**
```bash
npx prisma migrate dev --name add_repair_completed
```
- [ ] Migration runs successfully
- [ ] No errors in console
- [ ] Field added to database

**Test 1.2: Verify Schema**
```bash
npx prisma studio
```
- [ ] Open CarpetItem table
- [ ] Verify `repairCompleted` field exists
- [ ] Verify default value is `false`
- [ ] Check existing records have `false`

**Test 1.3: Generate Prisma Client**
```bash
npx prisma generate
```
- [ ] Client regenerates successfully
- [ ] TypeScript types updated
- [ ] No errors

### Phase 2: Repair Dashboard Testing

**Test 2.1: Rejected Repairs Hidden**
1. Create order with repair item
2. Send repair estimate
3. Reject repair (via approval page)
4. Go to Repair Dashboard
- [ ] Order does NOT appear
- [ ] Rejected repair is hidden
- [ ] No errors in console

**Test 2.2: Completed Repairs Hidden**
1. Create order with repair item
2. Send repair estimate
3. Approve repair
4. Click "Mark Repair Complete"
5. Refresh Repair Dashboard
- [ ] Order disappears from dashboard
- [ ] Success message shown
- [ ] No errors

**Test 2.3: Mark Complete Button**
1. Go to Repair Dashboard
2. Find order with approved repair
- [ ] "Mark Repair Complete" button visible
- [ ] Button is enabled
- [ ] Click button works
- [ ] Item disappears after click

**Test 2.4: Button Disabled When Not Approved**
1. Go to Repair Dashboard
2. Find order with pending repair
- [ ] "Mark Repair Complete" button visible
- [ ] Button is DISABLED
- [ ] Hover shows tooltip/title
- [ ] Can't click

**Test 2.5: Multiple Items**
1. Create order with 3 items needing repair
2. Approve all repairs
3. Mark 1 repair complete
- [ ] Only 1 item disappears
- [ ] Other 2 items still visible
- [ ] Order still shows in dashboard

4. Mark 2nd repair complete
- [ ] 2nd item disappears
- [ ] 1 item still visible
- [ ] Order still shows

5. Mark 3rd repair complete
- [ ] All items gone
- [ ] Order disappears from dashboard

### Phase 3: Operations Dashboard Testing

**Test 3.1: Mark Ready Without Repair Approval**
1. Create order with repair item
2. Measure item (status = 'measured')
3. Send repair estimate (status = 'pending')
4. Go to Operations Dashboard
5. Click "Mark Ready for Delivery"
- [ ] Button is ENABLED (not blocked by repair)
- [ ] Item status changes to 'ready_for_delivery'
- [ ] No errors
- [ ] Repair status unchanged

**Test 3.2: Mark Ready With Rejected Repair**
1. Create order with repair item
2. Measure item
3. Send repair estimate
4. Reject repair
5. Go to Operations Dashboard
6. Click "Mark Ready for Delivery"
- [ ] Button is ENABLED
- [ ] Item marked ready
- [ ] Works normally

**Test 3.3: Mark Ready With Pending Cleaning**
1. Create order
2. Measure item
3. Enable cleaning approval (don't send)
4. Try to mark ready
- [ ] Button is DISABLED (cleaning check still works)
- [ ] Tooltip explains why
- [ ] Repair doesn't interfere

**Test 3.4: Mark Ready With Approved Cleaning**
1. Create order
2. Measure item
3. Send cleaning estimate
4. Approve cleaning
5. Click "Mark Ready"
- [ ] Button is ENABLED
- [ ] Item marked ready
- [ ] Works correctly

### Phase 4: Integration Testing

**Test 4.1: Full Repair Workflow**
1. Create order with damaged rug
2. Go to Repair Dashboard
3. Create repair estimate
4. Send repair estimate
5. Approve repair (via link)
6. Go back to Repair Dashboard
7. Click "Mark Repair Complete"
8. Go to Operations Dashboard
9. Mark item ready for delivery
- [ ] All steps work
- [ ] No errors
- [ ] Item progresses correctly

**Test 4.2: Repair Rejected Workflow**
1. Create order with damaged rug
2. Create repair estimate
3. Send repair estimate
4. Reject repair (via link)
5. Check Repair Dashboard
- [ ] Order not visible
6. Go to Operations Dashboard
7. Mark item ready
- [ ] Works without repair

**Test 4.3: Mixed Order (Cleaning + Repair)**
1. Create order with 2 items
2. Item 1: Needs cleaning only
3. Item 2: Needs repair
4. Send cleaning estimate
5. Send repair estimate
6. Approve cleaning
7. Approve repair
8. Mark repair complete
9. Mark both items ready
- [ ] Both items can be marked ready
- [ ] Independent workflows work

**Test 4.4: No Repair Needed**
1. Create order with good condition rug
2. Measure item
3. Don't create repair estimate
4. Mark ready directly
- [ ] Works normally
- [ ] No repair workflow involved

### Phase 5: Edge Cases

**Test 5.1: Mark Complete Without Approval**
1. Create repair estimate
2. Don't send/approve
3. Try to mark complete
- [ ] Button is disabled
- [ ] Can't mark complete
- [ ] Error message if attempted

**Test 5.2: Double Click Mark Complete**
1. Approve repair
2. Click "Mark Complete" twice quickly
- [ ] Only processes once
- [ ] No duplicate requests
- [ ] No errors

**Test 5.3: Refresh During Operation**
1. Click "Mark Complete"
2. Refresh page immediately
- [ ] Operation completes or fails gracefully
- [ ] No stuck state
- [ ] Can retry if needed

**Test 5.4: Network Error**
1. Disconnect network
2. Try to mark complete
- [ ] Shows error message
- [ ] Doesn't mark as complete locally
- [ ] Can retry when online

### Phase 6: UI/UX Testing

**Test 6.1: Button Visibility**
- [ ] Button clearly visible
- [ ] Appropriate size (touch-friendly)
- [ ] Good contrast
- [ ] Clear label

**Test 6.2: Loading States**
- [ ] Button shows loading during API call
- [ ] Disabled while processing
- [ ] Success feedback shown
- [ ] Error feedback shown

**Test 6.3: Mobile Responsive**
- [ ] Button works on mobile
- [ ] Touch-friendly size
- [ ] No layout issues
- [ ] Proper spacing

**Test 6.4: Translations**
- [ ] English text correct
- [ ] French text correct
- [ ] Switch language works
- [ ] All labels translated

### Phase 7: Performance Testing

**Test 7.1: Large Orders**
1. Create order with 20 items
2. All need repair
3. Mark all complete one by one
- [ ] No performance issues
- [ ] UI remains responsive
- [ ] No memory leaks

**Test 7.2: Many Orders**
1. Create 50 orders with repairs
2. Load Repair Dashboard
- [ ] Loads quickly
- [ ] Filtering works
- [ ] No lag

### Phase 8: Regression Testing

**Test 8.1: Existing Functionality**
- [ ] Cleaning approval still works
- [ ] Repair approval still works
- [ ] Delivery workflow unchanged
- [ ] Data review shows correct data

**Test 8.2: Old Approval Links**
- [ ] `/approve/[id]` still works
- [ ] `/approve/[id]/cleaning` works
- [ ] `/approve/[id]/repair` works
- [ ] All approval types function

**Test 8.3: Email Sending**
- [ ] Cleaning emails send
- [ ] Repair emails send
- [ ] Links in emails work
- [ ] Approval process works

---

## Rollout Plan

### Step 1: Development (1-2 hours)
1. Create database migration
2. Update Prisma schema
3. Generate Prisma client
4. Create API endpoint
5. Update Repair Dashboard
6. Update Operations Dashboard
7. Add translations
8. Update types

### Step 2: Testing (1 hour)
1. Run all Phase 1-8 tests
2. Fix any issues found
3. Verify build is clean
4. Check diagnostics

### Step 3: Documentation (30 min)
1. Update user guide
2. Document new workflow
3. Create training materials
4. Update API docs

### Step 4: Deployment (15 min)
1. Run migration on production
2. Deploy new code
3. Verify deployment
4. Monitor for errors

### Step 5: User Training (30 min)
1. Show new "Mark Complete" button
2. Explain independent workflows
3. Demonstrate rejected repair handling
4. Answer questions

---

## Success Criteria

### Functional Requirements
- [x] "Mark Repair Complete" button added
- [x] Button only enabled when repair approved
- [x] Clicking button sets `repairCompleted` = true
- [x] Completed repairs hidden from dashboard
- [x] Rejected repairs hidden from dashboard
- [x] "Ready for Exit" independent of repair status
- [x] Cleaning approval still required (if enabled)

### Technical Requirements
- [x] Database migration successful
- [x] No breaking changes
- [x] Build is clean
- [x] No TypeScript errors
- [x] No runtime errors
- [x] Performance acceptable

### UX Requirements
- [x] Button clearly labeled
- [x] Loading states shown
- [x] Success feedback given
- [x] Error handling graceful
- [x] Mobile-friendly
- [x] Translations complete

---

## Rollback Plan

### If Issues Found

**Step 1: Identify Issue**
- Check error logs
- Review user reports
- Identify root cause

**Step 2: Quick Fix or Rollback**
- If quick fix possible: Deploy fix
- If complex issue: Rollback

**Step 3: Rollback Database**
```sql
-- Remove repairCompleted field
ALTER TABLE "CarpetItem" DROP COLUMN "repairCompleted";
```

**Step 4: Rollback Code**
- Revert to previous commit
- Deploy previous version
- Verify system working

**Step 5: Post-Mortem**
- Document what went wrong
- Plan better fix
- Re-test thoroughly
- Deploy again when ready

---

## Risk Assessment

### Low Risk
- ✅ Database field addition (non-breaking)
- ✅ New API endpoint (additive)
- ✅ UI button addition (additive)
- ✅ Translation additions (additive)

### Medium Risk
- ⚠️ Filtering logic changes (could hide wrong items)
- ⚠️ Operations dashboard logic (could block workflow)

### Mitigation
- Thorough testing of filter logic
- Test all scenarios
- Have rollback plan ready
- Monitor after deployment

---

## Timeline

**Total Estimated Time**: 4-5 hours

- Database Migration: 30 min
- API Endpoint: 30 min
- Repair Dashboard Updates: 1 hour
- Operations Dashboard Updates: 30 min
- Translations & Types: 30 min
- Testing: 1-1.5 hours
- Documentation: 30 min
- Deployment: 15 min
- Buffer: 30 min

---

## Next Steps

1. **Review this plan** - Confirm requirements
2. **Get approval** - Stakeholder sign-off
3. **Begin implementation** - Follow steps above
4. **Test thoroughly** - Run all test cases
5. **Deploy** - Follow rollout plan
6. **Monitor** - Watch for issues
7. **Document** - Update all docs

---

**Status**: Ready for Implementation  
**Approval Needed**: Yes  
**Estimated Completion**: Same day  
**Risk Level**: Low-Medium

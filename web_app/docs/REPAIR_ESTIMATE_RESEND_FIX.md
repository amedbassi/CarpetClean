# Repair Estimate Re-send Logic Fix

## Requirement

The "Send Repair" button should be greyed out (disabled) if the estimate has been sent and not edited.

## Implementation

### 1. Disable Button After Sending
**File:** `src/components/RepairDashboard.tsx`

The "Send Repair" button is now disabled when:
- No repair costs have been added (existing logic)
- OR the repair approval status is 'pending' or 'approved' (new logic)

```typescript
disabled={
    !order.repairItems.some(item => (item.repairCost || 0) > 0) ||
    (order.repairApprovalStatus === 'pending' || order.repairApprovalStatus === 'approved')
}
```

**Button States:**
- ✅ Enabled: When repair costs exist AND status is 'not_needed' or 'rejected'
- ❌ Disabled: When no repair costs OR status is 'pending' or 'approved'

### 2. Reset Status When Editing
**File:** `src/components/RepairEstimateForm.tsx`

When a repair estimate is edited and saved, the approval status is automatically reset to 'not_needed', which re-enables the "Send Repair" button.

```typescript
// After saving the estimate, reset approval status
const resetResponse = await fetch('/api/orders/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        orderId,
        repairApprovalStatus: 'not_needed'
    }),
});
```

## User Flow

### Scenario 1: First Time Sending Estimate
```
1. Create repair estimate (add cost + description)
   └─> repairApprovalStatus = 'not_needed'
   └─> "Send Repair" button: ENABLED ✅

2. Click "Send Repair"
   └─> repairApprovalStatus = 'pending'
   └─> Email sent to client
   └─> "Send Repair" button: DISABLED ❌

3. Client approves
   └─> repairApprovalStatus = 'approved'
   └─> "Send Repair" button: DISABLED ❌
```

### Scenario 2: Editing After Sending
```
1. Estimate already sent
   └─> repairApprovalStatus = 'pending'
   └─> "Send Repair" button: DISABLED ❌

2. Click "Edit Estimate" and modify cost/description
   └─> Make changes to repair estimate

3. Click "Save & Set Estimated"
   └─> repairApprovalStatus = 'not_needed' (reset)
   └─> "Send Repair" button: ENABLED ✅

4. Click "Send Repair" again
   └─> repairApprovalStatus = 'pending'
   └─> Updated estimate sent to client
   └─> "Send Repair" button: DISABLED ❌
```

### Scenario 3: Client Rejects Estimate
```
1. Estimate sent and rejected
   └─> repairApprovalStatus = 'rejected'
   └─> "Send Repair" button: ENABLED ✅

2. Edit estimate with new pricing
   └─> repairApprovalStatus = 'not_needed' (reset)
   └─> "Send Repair" button: ENABLED ✅

3. Send updated estimate
   └─> repairApprovalStatus = 'pending'
   └─> "Send Repair" button: DISABLED ❌
```

## Button Tooltips

The button now shows helpful tooltips:
- "Add repair estimates first" - When no costs added
- "Estimate already sent" - When status is pending/approved
- "Send Repair Estimate" - When ready to send

## Visual States

### Enabled State
```
Background: Orange (bg-orange-600)
Hover: Darker orange (hover:bg-orange-700)
Cursor: Pointer
```

### Disabled State
```
Background: Gray (bg-gray-300)
Text: Gray (text-gray-500)
Cursor: Not allowed
Hover: No change (disabled:hover:bg-gray-300)
```

## Benefits

1. **Prevents Duplicate Emails**: Can't accidentally send the same estimate multiple times
2. **Clear Workflow**: Visual feedback shows when estimate has been sent
3. **Allows Updates**: Editing the estimate automatically re-enables sending
4. **Handles Rejections**: If client rejects, can send updated estimate

## Status Flow Diagram

```
not_needed ──────────────────────────────────────┐
    ↓                                             │
    │ (Click "Send Repair")                      │
    ↓                                             │
pending ──────────────────────────────────────┐  │
    ↓                                          │  │
    │ (Client responds)                        │  │
    ↓                                          │  │
    ├─> approved (Button stays disabled)      │  │
    └─> rejected (Button enabled)             │  │
                                               │  │
    (Edit estimate) ───────────────────────────┴──┘
    └─> Resets to 'not_needed'
```

## Files Modified

1. `src/components/RepairDashboard.tsx` - Added disabled logic for sent estimates
2. `src/components/RepairEstimateForm.tsx` - Added reset logic when editing

## Testing

To verify the fix:

1. Create a repair estimate and send it
   - Button should become disabled after sending
2. Edit the estimate and save
   - Button should become enabled again
3. Send the updated estimate
   - Button should become disabled again
4. Have client approve the estimate
   - Button should remain disabled

## Related Features

This works with:
- Email sending system for repair estimates
- Approval page where clients approve/reject
- Repair dashboard status badges

# CarpetClean Pro - Complete Order Flow Chart

## Overview
This document maps the complete order lifecycle from intake to delivery, including approval flows and status transitions.

---

## 1. ORDER LIFECYCLE - Main Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ORDER LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌──────────────────┐
│  1. INTAKE       │  Page: / (DeliveryForm)
│  Create Order    │  - Select/Create Client
│                  │  - Add Carpet Items
│  Status: pending │  - Upload Receipt (OCR)
└────────┬─────────┘  - Capture Signature
         │
         ▼
┌──────────────────┐
│  2. OPERATIONS   │  Page: /operations
│  Measure Carpets │  - Measure each carpet (length × width)
│                  │  - Select material type
│  Status:         │  - Auto-calculate cleaning cost
│  pending →       │  - Assess condition (Good/Worn/Damaged)
│  measured        │
└────────┬─────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│  3a. CLEANING    │                    │  3b. REPAIR      │
│  (if needed)     │                    │  (if Worn/       │
│                  │                    │   Damaged)       │
│  Optional:       │                    │                  │
│  Approval Flow   │                    │  Add repair      │
│                  │                    │  estimates       │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌──────────────────┐                    ┌──────────────────┐
│  Mark Ready      │                    │  Send Repair     │
│                  │                    │  Estimate        │
│  Status:         │                    │                  │
│  measured →      │                    │  Status:         │
│  ready_for_      │                    │  repair_         │
│  delivery        │                    │  estimated       │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  4. DELIVERY     │  Page: /delivery
                │                  │  - Select orders
                │  Optimize Route  │  - AI route optimization
                │  Complete        │  - Capture signature
                │  Delivery        │  - Mark delivered
                │                  │
                │  Status:         │
                │  ready_for_      │
                │  delivery →      │
                │  delivered       │
                └────────┬─────────┘
                         │
                         ▼
                       END
```

---

## 2. APPROVAL FLOW - Detailed Logic

```
┌─────────────────────────────────────────────────────────────────────┐
│                      APPROVAL FLOW LOGIC                             │
└─────────────────────────────────────────────────────────────────────┘

OPERATIONS PAGE - Cleaning Approval
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│ Enable "Approval Flow" Checkbox                              │
│                                                               │
│ Sets:                                                         │
│ - requiresCleaningApproval = true                           │
│ - cleaningApprovalStatus = 'not_needed'                     │
│                                                               │
│ Result: No status badge shown yet                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ All carpets  │
                  │ measured?    │
                  └──────┬───────┘
                         │
                    YES  │  NO → Cannot send
                         │
                         ▼
                  ┌──────────────┐
                  │ Client has   │
                  │ email?       │
                  └──────┬───────┘
                         │
                    YES  │  NO → Show error
                         │
                         ▼
            ┌────────────────────────┐
            │ Click "Send Cleaning"  │
            │                        │
            │ Actions:               │
            │ 1. Copy link to        │
            │    clipboard           │
            │ 2. Set status =        │
            │    'pending'           │
            │ 3. Send email          │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Status Badge Appears   │
            │                        │
            │ 🟠 PENDING (orange)    │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Client Reviews         │
            │ /approve/[orderId]     │
            └────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ Client         │      │ Client         │
│ APPROVES       │      │ REJECTS        │
│                │      │                │
│ Status =       │      │ Status =       │
│ 'approved'     │      │ 'rejected'     │
│                │      │                │
│ 🟢 APPROVED    │      │ 🔴 REJECTED    │
│    (green)     │      │    (red)       │
└────────┬───────┘      └────────┬───────┘
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ "Mark Ready"   │      │ "Mark Ready"   │
│ button         │      │ button         │
│ ENABLED        │      │ DISABLED       │
└────────────────┘      └────────────────┘
```

---

## 3. REPAIR FLOW - Detailed Logic

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REPAIR FLOW LOGIC                             │
└─────────────────────────────────────────────────────────────────────┘

OPERATIONS PAGE - During Measurement
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│ Assess Carpet Condition                                       │
│                                                               │
│ Options:                                                      │
│ - Good      → No repair needed                               │
│ - Worn      → Automatically goes to Repair page             │
│ - Damaged   → Automatically goes to Repair page             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ Condition =  │
                  │ Worn or      │
                  │ Damaged?     │
                  └──────┬───────┘
                         │
                    YES  │  NO → Skip repair
                         │
                         ▼
            ┌────────────────────────┐
            │ REPAIR PAGE            │
            │ /repair                │
            │                        │
            │ Carpet appears         │
            │ automatically          │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Add Repair Estimate    │
            │                        │
            │ - Repair description   │
            │ - Repair cost          │
            │                        │
            │ Status Badge:          │
            │ 🟠 NEEDS ESTIMATE      │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Repair cost added?     │
            └────────┬───────────────┘
                     │
                YES  │  NO → Button disabled
                     │
                     ▼
            ┌────────────────────────┐
            │ "Send Repair" button   │
            │ ENABLED                │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Click "Send Repair"    │
            │                        │
            │ Actions:               │
            │ 1. Copy link to        │
            │    clipboard           │
            │ 2. Set status =        │
            │    'pending'           │
            │ 3. Send email          │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Status Badge Appears   │
            │                        │
            │ 🟠 PENDING (orange)    │
            └────────┬───────────────┘
                     │
                     ▼
            ┌────────────────────────┐
            │ Client Reviews         │
            │ /approve/[orderId]     │
            └────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌────────────────┐      ┌────────────────┐
│ Client         │      │ Client         │
│ APPROVES       │      │ REJECTS        │
│                │      │                │
│ Status =       │      │ Status =       │
│ 'approved'     │      │ 'rejected'     │
│                │      │                │
│ 🟢 APPROVED    │      │ 🔴 REJECTED    │
│    (green)     │      │    (red)       │
└────────────────┘      └────────────────┘
```

---

## 4. STATUS TRANSITIONS - Item Level

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CARPET ITEM STATUS FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

pending
  │
  │ (Measure carpet in Operations)
  │
  ▼
measured
  │
  │ (Click "Mark Ready" - only if approval not required OR approved)
  │
  ▼
ready_for_delivery
  │
  │ (Complete delivery in Delivery page)
  │
  ▼
delivered
```

---

## 5. APPROVAL STATUS VALUES

### Cleaning Approval Status
```
not_needed  → No badge shown (default when checkbox enabled)
            ↓
pending     → 🟠 Orange badge (after "Send Cleaning" clicked)
            ↓
            ├→ approved  → 🟢 Green badge
            └→ rejected  → 🔴 Red badge
```

### Repair Approval Status
```
not_needed  → No badge shown (default)
            ↓
pending     → 🟠 Orange badge (after "Send Repair" clicked)
            ↓
            ├→ approved  → 🟢 Green badge
            └→ rejected  → 🔴 Red badge
```

---

## 6. BUTTON STATES & CONDITIONS

### Operations Page

#### "Mark Ready" Button
```
VISIBLE: When item.status === 'measured'

ENABLED: When:
  - Cleaning approval NOT required
    OR
  - Cleaning approval required AND cleaningApprovalStatus === 'approved'

DISABLED: When:
  - Cleaning approval required AND status !== 'approved'
  - Shows greyed out with disabled styling

NOTE: Repair approval does NOT affect this button
```

#### "Send Cleaning" Button
```
VISIBLE: When requiresCleaningApproval === true

ENABLED: When BOTH conditions are true:
  1. All items are measured
  2. Client has email address

ACTION:
  1. Copy approval link to clipboard
  2. Update cleaningApprovalStatus to 'pending'
  3. Send email with approval link
  4. Show success/failure message
```

#### "Cleaning Approval" Checkbox
```
LABEL: "Cleaning Approval" (not "Approval Flow")

CHECKED: When requiresCleaningApproval === true

ACTION: Toggles requiresCleaningApproval only
  - Does NOT affect repair approval
  - Sets cleaningApprovalStatus to 'not_needed'
```

### Repair Page

#### "Send Repair" Button
```
VISIBLE: Always (for orders with Worn/Damaged items)

ENABLED: When:
  - At least one item has repairCost > 0

DISABLED: When:
  - No repair costs added yet
  - Shows greyed out with disabled styling

ACTION:
  1. Copy approval link to clipboard
  2. Update repairApprovalStatus to 'pending'
  3. Send email with approval link
  4. Show success/failure message

NOTE: Repair approval is INDEPENDENT
  - Does NOT block "Mark Ready" in Operations
  - Repair approval is for client information only
  - Carpets can proceed to delivery regardless of repair approval status
```

---

## 7. CURRENT ISSUE ANALYSIS

### Issue: "Mark Ready" Greyed Out in Order 39

**Diagnosis:**
```
Order 39 has:
  ├─ requiresCleaningApproval = true (Approval Flow enabled)
  └─ cleaningApprovalStatus = 'not_needed' (estimate not sent yet)

Button condition:
  disabled = (true || false) && ('not_needed' !== 'approved')
  disabled = true && true
  disabled = TRUE ✗

Result: Button is greyed out
```

**Solution Options:**

1. **Send the cleaning estimate first**
   - Click "Send Cleaning" button
   - Client approves
   - Status becomes 'approved'
   - Button becomes enabled

2. **Disable approval flow**
   - Uncheck "Approval Flow" checkbox
   - Button becomes enabled immediately

3. **Change logic** (if desired)
   - Allow "Mark Ready" when status is 'not_needed'
   - Only block when status is 'pending' or 'rejected'

---

## 8. RECOMMENDED LOGIC CHANGE

### Current Logic (Strict)
```
Mark Ready DISABLED when:
  (requiresApproval) AND (status !== 'approved')

This blocks when status is:
  - 'not_needed' ✗ (too strict)
  - 'pending' ✓ (correct)
  - 'rejected' ✓ (correct)
```

### Proposed Logic (Flexible)
```
Mark Ready DISABLED when:
  (requiresApproval) AND (status === 'pending' OR status === 'rejected')

This allows when status is:
  - 'not_needed' ✓ (can proceed without sending)
  - 'approved' ✓ (approved)

This blocks when status is:
  - 'pending' ✓ (waiting for approval)
  - 'rejected' ✓ (client rejected)
```

---

## 9. DECISION MATRIX

| Scenario | Current Behavior | Proposed Behavior |
|----------|------------------|-------------------|
| Approval Flow OFF | ✅ Can mark ready | ✅ Can mark ready |
| Approval Flow ON, not sent | ❌ Cannot mark ready | ✅ Can mark ready |
| Approval Flow ON, pending | ❌ Cannot mark ready | ❌ Cannot mark ready |
| Approval Flow ON, approved | ✅ Can mark ready | ✅ Can mark ready |
| Approval Flow ON, rejected | ❌ Cannot mark ready | ❌ Cannot mark ready |

---

## 10. QUESTIONS FOR CLARIFICATION

1. **Should "Mark Ready" be allowed before sending the estimate?**
   - Current: NO (blocked)
   - Proposed: YES (allowed)

2. **What is the purpose of the "Approval Flow" checkbox?**
   - Option A: Mandatory approval (must send & get approval)
   - Option B: Optional approval (can send if needed, but not required)

3. **When should items be blocked from delivery?**
   - Only when estimate is pending/rejected?
   - Or always when approval flow is enabled?

---

**Created:** February 26, 2026  
**Purpose:** Complete order flow documentation and logic analysis

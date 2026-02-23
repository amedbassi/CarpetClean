# Clean Start Guide

## Step 1: Clear All Existing Data

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `clear-database.sql`
4. Click **Run** to execute
5. Verify all counts are 0 in the result

### Option B: Manual Deletion in Supabase

1. Go to **Table Editor** in Supabase
2. Delete data in this order:
   - First: Delete all rows from `CarpetItem` table
   - Second: Delete all rows from `Order` table
   - Third: Delete all rows from `Client` table

## Step 2: Verify Clean Database

After clearing, your database should have:
- ✅ 0 Clients
- ✅ 0 Orders
- ✅ 0 CarpetItems
- ✅ All table structures intact (schema unchanged)

## Step 3: Test Client Autocomplete Feature

### How It Works

When creating a new order in the Delivery Form:

1. **Start typing a client name** in the "Client Name" field
2. **Dropdown appears** showing matching existing clients
3. **Select a client** from the dropdown
4. **All fields auto-fill** with the client's previously entered data:
   - Phone number
   - Email address
   - Street
   - Number
   - Postal Code
   - City
   - Country

### Example Workflow

#### First Order for a New Client:
```
1. Enter: "John Doe"
2. No dropdown appears (new client)
3. Fill in all fields manually:
   - Phone: +41 79 123 4567
   - Email: john@example.com
   - Street: Bahnhofstrasse
   - Number: 123
   - Postal Code: 8001
   - City: Zürich
   - Country: Switzerland
4. Submit order
5. Client "John Doe" is created with all this information
```

#### Second Order for Existing Client:
```
1. Start typing: "John"
2. Dropdown shows: "John Doe (Existing Client)"
3. Click on "John Doe"
4. ALL fields automatically fill:
   - Phone: +41 79 123 4567
   - Email: john@example.com
   - Street: Bahnhofstrasse
   - Number: 123
   - Postal Code: 8001
   - City: Zürich
   - Country: Switzerland
5. Just add carpet items and submit!
```

## Step 4: Create Your First Test Order

1. Navigate to **Delivery** tab at http://localhost:3000/delivery
2. Order ID will be auto-generated (ORD-001)
3. Enter client information:
   - Client Name: [Your test client name]
   - Phone: [Optional]
   - Email: [Optional]
   - Address fields: [Optional]
4. Add carpet items (click + to add more)
5. Draw signature
6. Submit

## Step 5: Test the Complete Workflow

### A. Create Multiple Orders for Same Client

1. Create first order for "Test Client A"
2. Fill in all contact and address details
3. Submit
4. Create second order
5. Type "Test" in client name
6. Select "Test Client A" from dropdown
7. Verify all fields auto-fill ✅

### B. Test Operations Dashboard

1. Navigate to **Operations** tab
2. Find your test order
3. Click "Input Details" on a carpet item
4. Enter measurements and cleaning cost
5. Check "Requires Client Approval"
6. Click "Send Approval" button
7. Verify approval link is copied

### C. Test Client Editing

1. In Operations tab, find order with approval required
2. Click "Edit Client" button
3. Modify client information
4. Click "Save Changes"
5. Verify changes are saved
6. Create new order with same client
7. Verify updated information appears in autocomplete

## Features to Test

### ✅ Client Autocomplete
- Type partial name → shows matching clients
- Select client → all fields auto-fill
- New client → no dropdown, create new

### ✅ Client Data Persistence
- Client info saved once
- Reused across multiple orders
- Updates apply to all future orders

### ✅ Edit Client Information
- Edit button in Operations dashboard
- Modal with all client fields
- Save updates to database
- Updated info appears in autocomplete

### ✅ Send Approval
- Validates client has email OR phone
- Validates all items are measured
- Copies approval link to clipboard
- Shows client contact info

## Database Structure

After creating test data, you should have:

```
Client Table:
- id: auto-generated
- name: "Test Client A"
- phone: "+41 79 123 4567"
- email: "test@example.com"
- street: "Bahnhofstrasse"
- number: "123"
- postalCode: "8001"
- city: "Zürich"
- country: "Switzerland"

Order Table:
- id: "ORD-001"
- clientId: [links to Client]
- requiresCleaningApproval: true/false
- cleaningApprovalStatus: "pending"/"approved"/"not_needed"
- requiresRepairApproval: true/false
- repairApprovalStatus: "pending"/"approved"/"not_needed"

CarpetItem Table:
- id: "C1", "C2", etc.
- orderId: "ORD-001"
- status: "pending"/"measured"/"ready_for_delivery"/"delivered"
- dimensions, material, state, costs, etc.
```

## Tips for Clean Data

1. **Use realistic client names** for testing
2. **Include contact info** (phone or email) to test approval flow
3. **Add complete addresses** to test autocomplete fully
4. **Create multiple orders per client** to verify data reuse
5. **Test editing client info** to ensure updates work

## Troubleshooting

### Dropdown not showing?
- Make sure you're typing at least 1 character
- Check that clients exist in database
- Verify client names match what you're typing

### Fields not auto-filling?
- Make sure you clicked on a client in the dropdown
- Check that client has data saved in those fields
- Verify "(Existing Client)" appears next to name

### Can't save client updates?
- Check browser console for errors
- Verify database connection
- Ensure email is unique (or empty)

## Next Steps

After testing with clean data:
1. Create realistic mock data for your use case
2. Test all workflows end-to-end
3. Deploy to Vercel
4. Share with team for feedback

---

**Your database is now ready for a fresh start!** 🎉

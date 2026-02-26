# Individual Client Feature

## What is "Individual Client"?

The `individualClient` field tracks **which end customer each carpet belongs to** when a main client/partner collects carpets from multiple people and brings them together in a single order.

## Business Model

### Main Client (Partner)
The **main client** is your business partner who:
- Collects carpets from multiple end customers
- Brings all carpets together in one order
- Acts as intermediary between you and end customers
- Examples: Hotel concierge, building manager, collection service

### Individual Clients (End Customers)
The **individual clients** are the actual carpet owners who:
- Give their carpets to the main client/partner
- Each person owns specific carpets within the order
- Pick up their carpets from the main client/partner when ready

## How It Works

### Example: Hotel Concierge Service

```
Main Client: Grand Hotel Geneva (your partner)
Order: ORD-001

Individual Clients (hotel guests):
- C1: "Mr. John Smith" (Room 305)
- C2: "Mr. John Smith" (Room 305)
- C3: "Mrs. Sarah Johnson" (Room 401)
- C4: "Mr. David Lee" (Suite 500)
- C5: "Mr. David Lee" (Suite 500)
```

**Workflow:**
1. Hotel guests give carpets to hotel concierge
2. Hotel concierge brings all carpets to you in one order
3. You clean/repair carpets, tracking each owner
4. Hotel concierge picks up all carpets
5. Hotel returns each carpet to the correct guest

### Example: Building Manager

```
Main Client: Lakeside Apartments Management (your partner)
Order: ORD-002

Individual Clients (residents):
- C1: "Alice Brown - Apt 12B"
- C2: "Bob Wilson - Apt 15A"
- C3: "Bob Wilson - Apt 15A"
- C4: "Carol Davis - Apt 20C"
```

**Workflow:**
1. Residents give carpets to building manager
2. Building manager brings all carpets to you
3. You process carpets, tracking each resident
4. Building manager picks up all carpets
5. Manager returns carpets to correct apartments

### Example: Corporate Collection Service

```
Main Client: CleanCo Collection Service (your partner)
Order: ORD-003

Individual Clients (their customers):
- C1: "Tech Startup Inc."
- C2: "Tech Startup Inc."
- C3: "Law Office Partners"
- C4: "Dr. Smith Clinic"
- C5: "Dr. Smith Clinic"
```

## Database Schema

```prisma
model Client {
  // Main client/partner
  id, name, phone, email, address
}

model Order {
  // Order from main client
  clientId -> Client
}

model CarpetItem {
  // Each carpet belongs to an individual client
  individualClient: String?  // End customer name
}
```

## Use Cases

### 1. Hotel Concierge Service
- **Main Client**: Hotel
- **Individual Clients**: Hotel guests
- **Benefit**: Hotel offers carpet cleaning service to guests

### 2. Apartment Building Management
- **Main Client**: Building management company
- **Individual Clients**: Residents/tenants
- **Benefit**: Convenient service for residents

### 3. Collection/Pickup Service
- **Main Client**: Collection service company
- **Individual Clients**: Their customers
- **Benefit**: Aggregated orders, easier logistics

### 4. Corporate Facility Management
- **Main Client**: Facility management company
- **Individual Clients**: Different offices/departments
- **Benefit**: Centralized service for multiple locations

## Benefits

### For You (Cleaning Service)
- ✅ Larger orders from partners
- ✅ Single point of contact (main client)
- ✅ Track individual carpet ownership
- ✅ Professional service with detailed tracking

### For Main Client (Partner)
- ✅ Offer value-added service to their customers
- ✅ Easy tracking of multiple carpets
- ✅ Clear records for billing/returns
- ✅ Professional appearance

### For Individual Clients (End Customers)
- ✅ Convenient carpet cleaning service
- ✅ No need to visit cleaning service directly
- ✅ Carpets tracked and returned correctly
- ✅ Trust in the process

## Features

### ✅ OCR Receipt Scanning
When main client brings receipt showing:
```
John Smith - 2 carpets
Sarah Johnson - 1 carpet
David Lee - 2 carpets
```

System automatically:
- Creates 5 carpet items
- Tags each with correct individual client name
- Saves manual data entry time

### ✅ Visual Display
- Operations dashboard shows individual client badge
- Easy to see who owns each carpet
- User icon for clear identification

### ✅ CSV Export
- Data Review includes individual client column
- Generate reports by end customer
- Track revenue per individual client

### ✅ Flexible Billing
- Bill main client for entire order
- Or bill individual clients separately
- Track costs per end customer

## Workflow Example

### Step 1: Main Client Collects Carpets
Hotel concierge collects carpets from guests:
- Room 305 (John Smith): 2 carpets
- Room 401 (Sarah Johnson): 1 carpet
- Suite 500 (David Lee): 2 carpets

### Step 2: Main Client Brings Order
Hotel brings all 5 carpets with receipt to your service

### Step 3: You Create Order
```
Main Client: Grand Hotel Geneva
Order: ORD-001

Scan receipt → System creates:
- C1: individualClient = "John Smith"
- C2: individualClient = "John Smith"
- C3: individualClient = "Sarah Johnson"
- C4: individualClient = "David Lee"
- C5: individualClient = "David Lee"
```

### Step 4: Processing
- Clean/repair each carpet
- Track measurements, costs per carpet
- Know exactly who owns what

### Step 5: Return to Main Client
Hotel picks up all 5 carpets with clear labels:
- C1, C2 → Return to John Smith (Room 305)
- C3 → Return to Sarah Johnson (Room 401)
- C4, C5 → Return to David Lee (Suite 500)

### Step 6: Main Client Returns to End Customers
Hotel concierge returns each carpet to correct guest

## API Support

### Creating Order with Individual Clients

```typescript
POST /api/orders
{
  "id": "ORD-001",
  "clientId": "grand_hotel_geneva",  // Main client
  "items": [
    {
      "id": "C1",
      "individualClient": "John Smith"  // End customer
    },
    {
      "id": "C2",
      "individualClient": "John Smith"
    },
    {
      "id": "C3",
      "individualClient": "Sarah Johnson"
    }
  ]
}
```

## When to Use

**Use individualClient when:**
- Main client is a partner/intermediary
- Multiple end customers in one order
- Need to track carpet ownership
- Partner needs to return carpets to correct people

**Don't use when:**
- Direct customer brings their own carpets
- Single end customer order
- No intermediary partner involved

## Data Structure

```
Client (Main Partner)
└── Order
    ├── CarpetItem 1 (Individual Client A)
    ├── CarpetItem 2 (Individual Client A)
    ├── CarpetItem 3 (Individual Client B)
    └── CarpetItem 4 (Individual Client C)
```

## Billing Options

### Option 1: Bill Main Client
- Single invoice to hotel/building manager
- They handle billing to end customers
- Simpler for you

### Option 2: Bill Individual Clients
- Separate invoices per end customer
- Main client facilitates payment collection
- More detailed tracking

## Data Review Export

CSV shows both main client and individual clients:
```csv
Client Name,Order ID,Item ID,Individual Client,Status,Cost
Grand Hotel,ORD-001,C1,John Smith,delivered,150.00
Grand Hotel,ORD-001,C2,John Smith,delivered,120.00
Grand Hotel,ORD-001,C3,Sarah Johnson,delivered,200.00
```

---

**Status: Fully Implemented and Working** ✅

The individualClient feature enables partner-based business model where main clients collect carpets from multiple end customers!

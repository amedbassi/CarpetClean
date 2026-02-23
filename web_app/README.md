# Carpet Cleaning Management System

A Next.js application for managing carpet cleaning orders, client information, and operations workflow.

## Features

- **Client Management**: Separate client database with structured address fields
- **Order Tracking**: Track orders from intake through delivery
- **Operations Dashboard**: Measure carpets, set estimates, manage workflow
- **Repair Estimates**: Track repair needs and costs separately from cleaning
- **Client Approval**: Send cleaning/repair estimates to clients for approval
- **Delivery Management**: Track ready-for-delivery and delivered items
- **Data Review**: Search and filter all orders with client information

## Database Schema

### Client Table
- Separate client records with unique IDs
- Fields: name, phone, email, street, number, postalCode, city, country
- Email is unique (allows NULL for clients without email)
- One client can have multiple orders

### Order Table
- Links to Client via `clientId`
- Separate approval tracking for cleaning and repair:
  - `requiresCleaningApproval` / `cleaningApprovalStatus`
  - `requiresRepairApproval` / `repairApprovalStatus`
- Signature and receipt storage

### CarpetItem Table
- Individual carpet items within orders
- Status tracking: pending → measured → ready_for_delivery → delivered
- Cleaning and repair cost tracking
- Material, dimensions, state, and photo storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_url"
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Clear Database

To start with a clean database, run the SQL script in Supabase SQL Editor:

```bash
# Copy contents of clear-database.sql and run in Supabase SQL Editor
```

Or use the npm script (requires database connection):
```bash
npm run clear-db
```

See `CLEAN_START_GUIDE.md` for detailed instructions.

## Migration Notes

The database was migrated from a flat order structure to a Client-based relational structure using `migration.sql`. The migration:
- Created the Client table
- Migrated existing client data from orders
- Added separate cleaning/repair approval tracking
- Removed old fields (clientName, phone, email, address from Order table)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── clients/      # Client management
│   │   ├── orders/       # Order management
│   │   ├── operations/   # Operations updates
│   │   └── delivery/     # Delivery tracking
│   ├── operations/       # Operations dashboard
│   ├── repair/           # Repair estimates
│   ├── delivery/         # Delivery management
│   ├── data/             # Data review
│   └── approve/          # Client approval pages
├── components/           # React components
└── lib/                  # Utilities (Prisma client)

prisma/
├── schema.prisma         # Database schema
└── seed.js              # Seed data (if needed)

scripts/
└── migrate-to-clients.ts # Migration script (reference only)
```

## Key Workflows

### 1. New Order Intake
- Navigate to Delivery tab
- Enter client name (autocomplete shows existing clients)
- Select existing client or create new one
- Add carpet items
- Capture signature
- Submit order

### 2. Operations Processing
- Navigate to Operations tab
- Click "Input Details" on pending items
- Measure carpets and set cleaning costs
- Optionally add repair estimates
- Check "Requires Client Approval" if needed
- Click "Send Approval" to get approval link
- Share link with client via email/phone

### 3. Client Approval
- Client opens approval link
- Reviews cleaning and/or repair estimates
- Approves or rejects
- Operations team notified of approval

### 4. Delivery
- Items marked as "Ready for Delivery" appear in Delivery tab
- Delivery team marks items as delivered
- System tracks delivery status

## API Endpoints

- `GET /api/orders` - List all orders with client data
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get specific order
- `POST /api/orders/update` - Update order approval status
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/[id]` - Update client information
- `POST /api/operations/update-item` - Update carpet item status
- `GET /api/delivery/ready` - Get items ready for delivery

## Development

Run linting:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

## License

Private project

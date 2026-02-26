# Quick Guide: Add Client Addresses

## Step 1: Get List of Clients

Run this query in Supabase SQL Editor to see all clients:

```sql
SELECT "id", "name", "email", "phone", "street", "postalCode", "city"
FROM "Client"
ORDER BY "name";
```

## Step 2: Add Addresses

Open `prisma/migrations/add_client_addresses.sql` and update each client:

```sql
UPDATE "Client" 
SET 
  "street" = 'Rue de Lausanne',
  "number" = '42',
  "postalCode" = '1201',
  "city" = 'Geneva',
  "country" = 'Switzerland'
WHERE "name" = 'Client Name';
```

## Step 3: Run the SQL

Copy your updated SQL and run it in Supabase SQL Editor.

## Step 4: Verify

Run this to check which clients still need addresses:

```sql
SELECT "name", "street", "postalCode", "city"
FROM "Client"
WHERE "street" IS NULL OR "postalCode" IS NULL OR "city" IS NULL;
```

---

## Route Optimization

The route optimization will now show an error if any selected order has a client without a complete address (street, postal code, city).

Error message will list which clients need addresses.

-- Add REAL Swiss addresses to all existing clients for testing route optimization
-- Run this in your Supabase SQL Editor
-- These are real, verifiable addresses from major Swiss cities

-- First, let's see how many clients we have
-- SELECT COUNT(*) FROM "Client";

-- Update clients with real Swiss addresses
-- This will cycle through 30 real addresses and assign them to clients

WITH real_addresses AS (
  SELECT * FROM (VALUES
    -- Geneva addresses
    ('Rue du Rhône', '65', '1204', 'Geneva', 'Switzerland'),
    ('Quai du Mont-Blanc', '17', '1201', 'Geneva', 'Switzerland'),
    ('Rue de Lausanne', '45', '1202', 'Geneva', 'Switzerland'),
    ('Boulevard Georges-Favon', '29', '1204', 'Geneva', 'Switzerland'),
    ('Rue de la Servette', '93', '1202', 'Geneva', 'Switzerland'),
    
    -- Zurich addresses
    ('Bahnhofstrasse', '100', '8001', 'Zurich', 'Switzerland'),
    ('Limmatquai', '34', '8001', 'Zurich', 'Switzerland'),
    ('Rennweg', '12', '8001', 'Zurich', 'Switzerland'),
    ('Langstrasse', '150', '8004', 'Zurich', 'Switzerland'),
    ('Universitätstrasse', '25', '8006', 'Zurich', 'Switzerland'),
    
    -- Bern addresses
    ('Kramgasse', '49', '3011', 'Bern', 'Switzerland'),
    ('Marktgasse', '33', '3011', 'Bern', 'Switzerland'),
    ('Bundesplatz', '3', '3003', 'Bern', 'Switzerland'),
    ('Spitalgasse', '20', '3011', 'Bern', 'Switzerland'),
    ('Gerechtigkeitsgasse', '81', '3011', 'Bern', 'Switzerland'),
    
    -- Basel addresses
    ('Freie Strasse', '39', '4001', 'Basel', 'Switzerland'),
    ('Steinenvorstadt', '53', '4051', 'Basel', 'Switzerland'),
    ('Aeschenvorstadt', '55', '4051', 'Basel', 'Switzerland'),
    ('Spalenberg', '12', '4051', 'Basel', 'Switzerland'),
    ('Barfüsserplatz', '8', '4051', 'Basel', 'Switzerland'),
    
    -- Lausanne addresses
    ('Place Saint-François', '2', '1003', 'Lausanne', 'Switzerland'),
    ('Rue de Bourg', '8', '1003', 'Lausanne', 'Switzerland'),
    ('Avenue de la Gare', '10', '1003', 'Lausanne', 'Switzerland'),
    ('Rue du Grand-Pont', '4', '1003', 'Lausanne', 'Switzerland'),
    ('Place de la Palud', '2', '1003', 'Lausanne', 'Switzerland'),
    
    -- Lugano addresses
    ('Via Nassa', '29', '6900', 'Lugano', 'Switzerland'),
    ('Piazza della Riforma', '1', '6900', 'Lugano', 'Switzerland'),
    ('Via Pretorio', '15', '6900', 'Lugano', 'Switzerland'),
    ('Corso Elvezia', '16', '6900', 'Lugano', 'Switzerland'),
    ('Via Canova', '12', '6900', 'Lugano', 'Switzerland')
  ) AS addresses(street, number, postal_code, city, country)
),
numbered_clients AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM "Client"
),
numbered_addresses AS (
  SELECT 
    street,
    number,
    postal_code,
    city,
    country,
    ROW_NUMBER() OVER (ORDER BY street) as rn
  FROM real_addresses
),
client_address_mapping AS (
  SELECT 
    nc.id,
    nc.name,
    na.street,
    na.number,
    na.postal_code,
    na.city,
    na.country
  FROM numbered_clients nc
  LEFT JOIN numbered_addresses na ON ((nc.rn - 1) % 30) + 1 = na.rn
)
UPDATE "Client" c
SET 
  "street" = cam.street,
  "number" = cam.number,
  "postalCode" = cam.postal_code,
  "city" = cam.city,
  "country" = cam.country
FROM client_address_mapping cam
WHERE c.id = cam.id;

-- Verify the update - show all clients with their new addresses
SELECT 
  "name", 
  "street" || ' ' || "number" as address,
  "postalCode", 
  "city", 
  "country"
FROM "Client"
ORDER BY "city", "name";

-- Show distribution by city
SELECT 
  "city",
  COUNT(*) as client_count
FROM "Client"
GROUP BY "city"
ORDER BY client_count DESC;

// DEPRECATED: This migration script is for the OLD schema (before Client table)
// Migration to new Client-based schema was completed via migration.sql
// This file is kept for reference only and should not be run

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('This migration script is deprecated.');
    console.log('Migration to Client-based schema was completed via migration.sql');
    console.log('Please do not run this script.');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const scriptsDir = join(process.cwd(), 'scripts');
const filesToPurge = [
    'check-ids.ts',
    'reseed-sequential.ts',
    'final-swiss-seed.ts',
    // Any other obsolete files
];

console.log('--- Cleaning up obsolete files ---');

filesToPurge.forEach(file => {
    const filePath = join(scriptsDir, file);
    if (existsSync(filePath)) {
        try {
            unlinkSync(filePath);
            console.log(`Deleted: ${file}`);
        } catch (err) {
            console.error(`Error deleting ${file}:`, err);
        }
    } else {
        console.log(`Not found (already clean): ${file}`);
    }
});

console.log('--- Cleanup Complete ---');

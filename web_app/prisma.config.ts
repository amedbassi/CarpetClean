import { defineConfig } from '@prisma/config';

export default defineConfig({
    schema: {
        kind: 'prisma',
        filePath: 'prisma/schema.prisma',
    },
    seed: {
        command: 'node prisma/seed.js',
    },
});

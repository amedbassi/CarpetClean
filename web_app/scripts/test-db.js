const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- DB Connection Test ---')
    try {
        console.log('Testing query...')
        const result = await prisma.$queryRaw`SELECT 1`
        console.log('✓ Query success:', result)

        console.log('Testing client count...')
        const count = await prisma.client.count()
        console.log('✓ Client count:', count)

    } catch (err) {
        console.error('✘ Connection failed!')
        console.error('Error Code:', err.code)
        console.error('Error Message:', err.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
鼓

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Attempting to connect to the database...')
        const result = await prisma.$queryRaw`SELECT 1`
        console.log('Connection successful!', result)

        const clientCount = await prisma.client.count()
        console.log('Number of clients in DB:', clientCount)

    } catch (error) {
        console.error('Connection failed!')
        console.error(error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
鼓

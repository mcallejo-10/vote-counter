const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function main() {
  try {
    // Crear o actualizar el estado de votación
    const votingStatus = await prisma.votingStatus.upsert({
      where: {
        id: 1,
      },
      update: {},
      create: {
        isOpen: false,
        password: process.env.ADMIN_PASSWORD || '123456',
      },
    })

    console.log('Estado de votación inicializado:', votingStatus)
  } catch (error) {
    console.error('Error al inicializar el estado de votación:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
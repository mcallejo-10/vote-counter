import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    // Verificar la contraseña
    const votingStatus = await prisma.votingStatus.findFirst()
    if (!votingStatus || votingStatus.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Eliminar todos los votos
    await prisma.vote.deleteMany()

    return NextResponse.json({ message: 'Votos reseteados con éxito' })
  } catch (error) {
    console.error('Error al resetear votos:', error)
    return NextResponse.json(
      { error: 'Error al resetear votos' },
      { status: 500 }
    )
  }
}
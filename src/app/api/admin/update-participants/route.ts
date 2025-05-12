import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password, participantCount } = body

    // Verificar la contraseña
    const votingStatus = await prisma.votingStatus.findFirst()
    if (!votingStatus || votingStatus.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Actualizar el número de participantes
    await prisma.votingStatus.update({
      where: { id: 1 },
      data: { participantCount },
    })

    return NextResponse.json({ message: 'Número de participantes actualizado' })
  } catch (error) {
    console.error('Error al actualizar participantes:', error)
    return NextResponse.json(
      { error: 'Error al actualizar participantes' },
      { status: 500 }
    )
  }
}
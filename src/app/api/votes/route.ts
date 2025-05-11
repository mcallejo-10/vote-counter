import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { votes } = await request.json()
    
    // Verificar si las votaciones están abiertas
    const votingStatus = await prisma.votingStatus.findFirst()
    if (!votingStatus?.isOpen) {
      return NextResponse.json(
        { error: 'Las votaciones están cerradas' },
        { status: 403 }
      )
    }

    // Crear los votos
    const sessionId = Math.random().toString(36).substring(7)
    
    await Promise.all(
      votes.map((number: number) =>
        prisma.vote.create({
          data: {
            number,
            sessionId,
          },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al procesar votos:', error)
    return NextResponse.json(
      { error: 'Error al procesar los votos' },
      { status: 500 }
    )
  }
}
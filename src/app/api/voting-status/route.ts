import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const votingStatus = await prisma.votingStatus.findFirst()
    return NextResponse.json({ isOpen: votingStatus?.isOpen || false })
  } catch (error) {
    console.error('Error al obtener estado de votación:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado de votación' },
      { status: 500 }
    )
  }
}
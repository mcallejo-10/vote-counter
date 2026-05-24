import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: { number: 'asc' },
    })
    return NextResponse.json({ participants })
  } catch (error) {
    console.error('Error obtenint participants:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

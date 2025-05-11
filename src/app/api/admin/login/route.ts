import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const votingStatus = await prisma.votingStatus.findFirst()
    
    if (!votingStatus || votingStatus.password !== password) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}
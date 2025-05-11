import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    const votingStatus = await prisma.votingStatus.findFirst()
    
    if (!votingStatus || votingStatus.password !== password) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const updatedStatus = await prisma.votingStatus.update({
      where: { id: votingStatus.id },
      data: { isOpen: !votingStatus.isOpen },
    })

    return NextResponse.json({ isOpen: updatedStatus.isOpen })
  } catch (error) {
    console.error('Error al cambiar estado de votación:', error)
    return NextResponse.json(
      { error: 'Error al cambiar estado de votación' },
      { status: 500 }
    )
  }
}
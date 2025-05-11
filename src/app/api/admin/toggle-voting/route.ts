import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Obtener la contraseña desde las variables de entorno
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD no está configurada')
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    const currentStatus = await prisma.votingStatus.findFirst()
    const newStatus = await prisma.votingStatus.update({
      where: { id: currentStatus?.id },
      data: { isOpen: !currentStatus?.isOpen },
    })

    return NextResponse.json({ isOpen: newStatus.isOpen })
  } catch (error) {
    console.error('Error al cambiar estado:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { password, contestName } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Error de configuració del servidor' }, { status: 500 })
    }
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Contrasenya incorrecta' }, { status: 401 })
    }
    if (!contestName?.trim()) {
      return NextResponse.json({ error: 'El nom no pot estar buit' }, { status: 400 })
    }

    const status = await prisma.votingStatus.findFirst()
    if (!status) {
      return NextResponse.json({ error: 'Configuració no trobada' }, { status: 500 })
    }

    await prisma.votingStatus.update({
      where: { id: status.id },
      data: { contestName: contestName.trim() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error actualitzant nom del concurs:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { password, participants } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Error de configuració del servidor' }, { status: 500 })
    }
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Contrasenya incorrecta' }, { status: 401 })
    }

    await Promise.all(
      participants.map(({ number, name }: { number: number; name: string }) =>
        prisma.participant.upsert({
          where: { number },
          update: { name },
          create: { number, name },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error actualitzant noms:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Error de configuració del servidor' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Contrasenya incorrecta' }, { status: 401 })
    }

    const votingStatus = await prisma.votingStatus.findFirst()
    const participantCount = votingStatus?.participantCount ?? 12

    const voteCounts = await prisma.vote.groupBy({
      by: ['number'],
      _count: { number: true },
    })

    const countsMap = new Map(voteCounts.map(v => [v.number, v._count.number]))
    const participants = await prisma.participant.findMany()
    const nameMap = new Map(participants.map(p => [p.number, p.name]))

    const rows: { participant: number; name: string; votes: number }[] = []
    for (let i = 1; i <= participantCount; i++) {
      rows.push({ participant: i, name: nameMap.get(i) || '', votes: countsMap.get(i) ?? 0 })
    }
    rows.sort((a, b) => b.votes - a.votes)

    const contestName = votingStatus?.contestName || 'Talent Xou'
    const lastClosedAt = votingStatus?.lastClosedAt
    const dateLabel = lastClosedAt
      ? `Darrer tancament:,${new Date(lastClosedAt).toLocaleString('ca-ES', { timeZone: 'Europe/Madrid' })}`
      : 'Darrer tancament:,No disponible'

    const csv = [
      `Concurs:,${contestName}`,
      dateLabel,
      '',
      'Nº,Nom,Vots',
      ...rows.map(r => `${r.participant},${r.name},${r.votes}`),
    ].join('\n')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultats-votacio.csv"',
      },
    })
  } catch (error) {
    console.error('Error exportant CSV:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

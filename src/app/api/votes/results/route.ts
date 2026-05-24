import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const votingStatus = await prisma.votingStatus.findFirst()

    // Verificar si hay votos
    const votesExist = await prisma.vote.findFirst()
    if (!votesExist) {
      return NextResponse.json({ results: [], lastClosedAt: votingStatus?.lastClosedAt ?? null })
    }

    // Obtener el conteo de votos por número
    const voteCounts = await prisma.vote.groupBy({
      by: ['number'],
      _count: {
        number: true
      }
    })

    // Formatear los resultados
    const results = voteCounts.map(count => ({
      number: count.number,
      count: count._count.number
    }))

    // Ordenar por número de votos (descendente)
    results.sort((a, b) => b.count - a.count)

    return NextResponse.json({ results, lastClosedAt: votingStatus?.lastClosedAt ?? null })
  } catch (error) {
    console.error('Error al obtener resultados:', error)
    return NextResponse.json(
      { error: 'Error al obtener resultados' },
      { status: 500 }
    )
  }
}
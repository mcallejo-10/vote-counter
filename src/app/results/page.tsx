'use client'

import { useState, useEffect } from 'react'

interface VoteCount {
  number: number
  count: number
}

const MEDALS = ['🥇', '🥈', '🥉']

const BAR_COLORS = [
  'bg-yellow-400',
  'bg-gray-400',
  'bg-amber-600',
]

export default function ResultsPage() {
  const [results, setResults] = useState<VoteCount[]>([])
  const [lastClosedAt, setLastClosedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/votes/results')
        const data = await response.json()
        setResults(data.results)
        setLastClosedAt(data.lastClosedAt ?? null)
      } catch (error) {
        setError('Error al carregar els resultats')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Carregant resultats...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  const maxVotes = results.length > 0 ? Math.max(...results.map(r => r.count)) : 1
  const totalVotes = results.reduce((sum, r) => sum + r.count, 0)

  const formattedDate = lastClosedAt
    ? new Date(lastClosedAt).toLocaleString('ca-ES', {
        timeZone: 'Europe/Madrid',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-10">
      <div className="max-w-sm mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            ← Enrere
          </button>
          <h1 className="text-xl font-bold text-gray-900">Resultats</h1>
          <div className="w-14" />
        </div>

        {/* Info: data tancament + total vots */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total de vots</span>
            <span className="font-bold text-gray-800">{totalVotes}</span>
          </div>
          {formattedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Darrer tancament</span>
              <span className="font-semibold text-gray-700">{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Llista de resultats */}
        {results.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Encara no hi ha vots</div>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={result.number}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${
                  index === 0 ? 'border-yellow-300' : index === 1 ? 'border-gray-300' : index === 2 ? 'border-amber-300' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{MEDALS[index] ?? `#${index + 1}`}</span>
                    <span className="text-lg font-bold text-gray-800">Número {result.number}</span>
                  </div>
                  <span className="text-base font-semibold text-gray-600">{result.count} vots</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${BAR_COLORS[index] ?? 'bg-blue-400'}`}
                    style={{ width: `${(result.count / maxVotes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
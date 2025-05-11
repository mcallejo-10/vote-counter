'use client'

import { useState, useEffect } from 'react'

interface VoteCount {
  number: number
  count: number
}

export default function ResultsPage() {
  const [results, setResults] = useState<VoteCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('/api/votes/results')
        const data = await response.json()
        setResults(data.results)
      } catch (error) {
        setError('Error al cargar los resultados')
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
        <div className="text-2xl text-gray-600">Cargando resultados...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Resultados de la Votación</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => (
          <div
            key={result.number}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold">Número {result.number}</span>
              <span className="text-lg">{result.count} votos</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{
                  width: `${(result.count / Math.max(...results.map(r => r.count))) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
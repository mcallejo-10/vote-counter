'use client'

import { useState } from 'react'

export default function Home() {
  const [selectedVotes, setSelectedVotes] = useState<number[]>([])

  const handleVoteSelect = (number: number) => {
    setSelectedVotes(prev => {
      // Si ya está seleccionado, lo removemos
      if (prev.includes(number)) {
        return prev.filter(n => n !== number)
      }
      // Si ya hay 3 votos, no permitimos más
      if (prev.length >= 3) {
        return prev
      }
      // Agregamos el nuevo voto
      return [...prev, number]
    })
  }

  const handleSubmit = async () => {
    if (selectedVotes.length === 0) return

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes: selectedVotes }),
      })

      if (response.ok) {
        setSelectedVotes([])
        alert('¡Votos registrados con éxito!')
      }
    } catch (error) {
      console.error('Error al enviar votos:', error)
      alert('Error al registrar los votos')
    }
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Votación de Talentos</h1>
      
      <div className="mb-6">
        <p className="text-center mb-4">
          Selecciona hasta 3 números para votar
          <br />
          <span className="text-sm text-gray-600">
            ({3 - selectedVotes.length} votos restantes)
          </span>
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(9)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handleVoteSelect(i + 1)}
              className={`p-4 text-xl font-bold rounded-lg transition-colors
                ${selectedVotes.includes(i + 1)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
                }
                ${selectedVotes.length >= 3 && !selectedVotes.includes(i + 1)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedVotes.length === 0}
          className={`w-full py-3 px-6 rounded-lg text-white font-bold
            ${selectedVotes.length > 0
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          Enviar Votos
        </button>
      </div>
    </main>
  )
}

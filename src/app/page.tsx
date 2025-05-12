'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export default function Home() {
  const [selectedVotes, setSelectedVotes] = useState<number[]>([])
  const [isVotingOpen, setIsVotingOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar si las votaciones están abiertas
  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const response = await fetch('/api/voting-status')
        const data = await response.json()
        setIsVotingOpen(data.isOpen)
      } catch (error) {
        console.error('Error al verificar estado de votación:', error)
      }
    }
    checkVotingStatus()
  }, [])

  const handleVoteSelect = (number: number) => {
    setSelectedVotes(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number)
      }
      if (prev.length >= 3) {
        toast.error('¡Solo puedes seleccionar 3 números!')
        return prev
      }
      return [...prev, number]
    })
  }

  const handleSubmit = async () => {
    if (selectedVotes.length < 3) {
      toast.error('Debes seleccionar exactamente 3 números para votar')
      return
    }

    setIsSubmitting(true)
    try {
      // Verificar si las votaciones siguen abiertas antes de enviar
      const statusResponse = await fetch('/api/voting-status')
      const statusData = await statusResponse.json()
      
      if (!statusData.isOpen) {
        setIsVotingOpen(false)
        toast.error('Las votaciones están cerradas')
        return
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes: selectedVotes }),
      })

      if (response.ok) {
        toast.success('¡Votos registrados con éxito!')
        setSelectedVotes([])
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al registrar los votos')
      }
    } catch (error) {
      toast.error('Error al enviar los votos')
      console.error('Error al enviar los votos:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVotingOpen) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Votacions <br /> Tancades</h1>
          <p className="text-gray-500">Les votacions no estan disponibles en aquests moments.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Votació <br /> Talent Xou</h1>
      
      <div className="mb-6">
        <p className="text-center text-xl mb-4">
          Selecciona els 3 números <br /> que més than agradat 
          <br />
          <span className="text-sm text-gray-600">
            ({3 - selectedVotes.length} números pendents de seleccionar)
          </span>
        </p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[...Array(12)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handleVoteSelect(i + 1)}
              disabled={selectedVotes.length >= 3 && !selectedVotes.includes(i + 1)}
              className={`
                aspect-square
                text-3xl font-bold
                rounded-lg
                transition-all
                transform hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedVotes.includes(i + 1)
                  ? 'bg-green-800 text-yellow-400 shadow-lg'
                  : 'bg-white border-4 border-gray-200 text-gray-500 hover:border-blue-500'
                }
              `}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedVotes.length !== 3 || isSubmitting}
          className={`
            w-full py-4 px-6
            font-bold
            text-xl
            transition-all
            text-white dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2
            ${selectedVotes.length === 3
              ? 'bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg '
              : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 cursor-not-allowed'
            }
            ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Vots'}
        </button>
      </div>
    </main>
  )
}

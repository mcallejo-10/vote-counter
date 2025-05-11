'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Home() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingClosed, setVotingClosed] = useState(false)

  useEffect(() => {
    checkVotingStatus()
  }, [])

  const checkVotingStatus = async () => {
    try {
      const response = await fetch('/api/voting-status')
      const data = await response.json()
      setVotingClosed(!data.isOpen)
    } catch (error) {
      console.error('Error al verificar estado de votación:', error)
    }
  }

  const handleNumberClick = (number: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, number]
    })
  }

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedNumbers.length === 0) return

    setIsSubmitting(true)
    try {
      // Verificar estado de votación antes de enviar
      const statusResponse = await fetch('/api/voting-status')
      const statusData = await statusResponse.json()
      
      if (!statusData.isOpen) {
        setVotingClosed(true)
        toast.error('Las votaciones están cerradas')
        return
      }

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ votes: selectedNumbers }),
      })

      if (response.ok) {
        toast.success('¡Votos registrados con éxito!')
        setSelectedNumbers([])
      } else {
        toast.error('Error al registrar los votos')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar los votos')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (votingClosed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Votaciones Cerradas
          </h2>
          <p className="text-gray-600">
            Las votaciones han finalizado. Gracias por tu participación.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Votación
        </h2>
        <p className="text-center text-gray-600">
          Selecciona hasta 3 números
        </p>
        <form onSubmit={handleVote} className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => handleNumberClick(number)}
                className={`
                  p-6 text-2xl font-bold rounded-lg
                  transition-all duration-200
                  ${
                    selectedNumbers.includes(number)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }
                  ${selectedNumbers.length >= 3 && !selectedNumbers.includes(number) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {number}
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            {selectedNumbers.length}/3 números seleccionados
          </div>
          <button
            type="submit"
            disabled={selectedNumbers.length === 0 || isSubmitting}
            className={`
              w-full py-3 px-4
              border border-transparent
              text-sm font-medium
              rounded-md text-white
              bg-blue-600 hover:bg-blue-700
              focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-blue-500
              transition-all
              ${(selectedNumbers.length === 0 || isSubmitting) && 'opacity-50 cursor-not-allowed'}
            `}
          >
            {isSubmitting ? 'Enviando...' : 'Votar'}
          </button>
        </form>
      </div>
    </main>
  )
}

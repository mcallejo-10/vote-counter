'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [votingStatus, setVotingStatus] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [participantCount, setParticipantCount] = useState(12)

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      handleInitialAuth(savedPassword)
    }
    // Obtener el número actual de participantes
    fetch('/api/voting-status')
      .then(res => res.json())
      .then(data => setParticipantCount(data.participantCount || 9))
      .catch(error => console.error('Error:', error))
  }, [])

  const handleInitialAuth = async (savedPassword: string) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: savedPassword }),
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        const status = await fetch('/api/voting-status')
        const data = await status.json()
        setVotingStatus(data.isOpen)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (response.ok) {
        setIsAuthenticated(true)
        localStorage.setItem('adminPassword', password)
        const status = await fetch('/api/voting-status')
        const data = await status.json()
        setVotingStatus(data.isOpen)
      } else {
        setError('Contraseña incorrecta')
      }
    } catch (error) {
      setError('Error al iniciar sesión')
      console.error(error)
    }
  }

  const handleToggleVoting = async () => {  // Renombramos toggleVoting a handleToggleVoting
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/toggle-voting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setVotingStatus(data.isOpen)
      }
    } catch (error) {
      setError('Error al cambiar el estado de la votación')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewResults = () => {
    window.location.href = '/results'
  }

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres resetear todas las votaciones? Esta acción no se puede deshacer.')) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/reset-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      if (response.ok) {
        toast.success('¡Votaciones reseteadas con éxito!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al resetear las votaciones')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al resetear las votaciones')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateParticipants = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/update-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, participantCount }),
      })
      
      if (response.ok) {
        toast.success('¡Número de participantes actualizado!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar participantes')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar participantes')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Panel de Administración
          </h2>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <input type="hidden" name="remember" defaultValue="true" />
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-8">Panel de Administración</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleToggleVoting}
          disabled={isSubmitting}
          className={`
            w-full py-4 px-6
            rounded-lg
            text-white font-bold
            transition-all
            ${votingStatus ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
            ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {isSubmitting ? 'Procesando...' : votingStatus ? 'Tancar Votacions' : 'Obrir Votacions'}
        </button>

        <button
          onClick={handleViewResults}
          className="w-full py-4 px-6 rounded-lg text-white font-bold bg-blue-500 hover:bg-blue-600 transition-all"
        >
          Veure Resultats
        </button>

        <button
          onClick={handleReset}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-lg text-white font-bold bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Procesando...' : 'Resetejar Votacions'}
        </button>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Número de Participantes
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="99"
              value={participantCount}
              onChange={(e) => setParticipantCount(parseInt(e.target.value))}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2"
            />
            <button
              onClick={handleUpdateParticipants}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
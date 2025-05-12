'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [votingStatus, setVotingStatus] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)  // Añadimos este estado

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
          {isSubmitting ? 'Procesando...' : votingStatus ? 'Cerrar Votaciones' : 'Abrir Votaciones'}
        </button>

        <button
          onClick={handleViewResults}
          className="w-full py-4 px-6 rounded-lg text-white font-bold bg-blue-500 hover:bg-blue-600 transition-all"
        >
          Ver Resultados
        </button>

        <button
          onClick={handleReset}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-lg text-white font-bold bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Procesando...' : 'Resetear Votaciones'}
        </button>
      </div>
    </main>
  )
}
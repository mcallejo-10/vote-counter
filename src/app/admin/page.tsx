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
  const [confirmReset, setConfirmReset] = useState(false)
  const [showNames, setShowNames] = useState(false)
  const [participantNames, setParticipantNames] = useState<Record<number, string>>({})

  useEffect(() => {
    const savedPassword = localStorage.getItem('adminPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      handleInitialAuth(savedPassword)
    }
    fetch('/api/voting-status')
      .then(res => res.json())
      .then(data => setParticipantCount(data.participantCount || 9))
      .catch(error => console.error('Error:', error))
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => {
        const map: Record<number, string> = {}
        for (const p of data.participants ?? []) map[p.number] = p.name
        setParticipantNames(map)
      })
      .catch(error => console.error('Error carregant noms:', error))
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

  const handleSaveNames = async () => {
    setIsSubmitting(true)
    try {
      const participants = Object.entries(participantNames).map(([number, name]) => ({
        number: parseInt(number),
        name,
      }))
      const response = await fetch('/api/admin/update-participant-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, participants }),
      })
      if (response.ok) {
        toast.success('Noms desats!')
        setShowNames(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error desant els noms')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error desant els noms')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminPassword')
    setIsAuthenticated(false)
    setPassword('')
  }

  const handleReset = async () => {
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

  const handleExportCSV = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/export-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Error en descarregar el CSV')
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resultats-votacio.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV descarregat!')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error en descarregar el CSV')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900">Panell Admin</h2>
            <p className="text-gray-500 text-sm mt-1">Talent Xou</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 text-gray-900"
              placeholder="Contrasenya"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <button
              type="submit"
              className="w-full py-3 px-4 text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-10">
      <div className="max-w-sm mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <h1 className="text-xl font-bold text-gray-900">Panell Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Tancar sessió
          </button>
        </div>

        {/* Estat actual */}
        <div className={`rounded-2xl p-5 text-center ${
          votingStatus ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100 border-2 border-gray-300'
        }`}>
          <div className="text-4xl mb-1">{votingStatus ? '🟢' : '⚫'}</div>
          <p className="text-lg font-bold text-gray-800">
            {votingStatus ? 'Votacions obertes' : 'Votacions tancades'}
          </p>
        </div>

        {/* Acció principal */}
        <button
          onClick={handleToggleVoting}
          disabled={isSubmitting}
          className={`w-full py-5 px-6 rounded-2xl text-white text-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${
            votingStatus
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isSubmitting ? 'Processant...' : votingStatus ? '⏹ Tancar Votacions' : '▶ Obrir Votacions'}
        </button>

        {/* Accions secundàries */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleViewResults}
            className="py-4 px-3 rounded-2xl text-white font-bold bg-blue-500 hover:bg-blue-600 active:scale-95 transition-all text-sm"
          >
            📊 Veure Resultats
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isSubmitting}
            className="py-4 px-3 rounded-2xl text-white font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 text-sm"
          >
            ⬇️ Descarregar CSV
          </button>
        </div>

        {/* Configuració participants */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">Número de participants</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="99"
              value={participantCount}
              onChange={(e) => setParticipantCount(parseInt(e.target.value))}
              className="flex-1 rounded-xl border-2 border-gray-400 px-4 py-3 text-black focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleUpdateParticipants}
              disabled={isSubmitting}
              className="px-5 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 text-sm"
            >
              Guardar
            </button>
          </div>
        </div>

        {/* Noms dels participants */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-gray-600">Noms dels participants</p>
            <button
              onClick={() => setShowNames(!showNames)}
              className="text-sm text-indigo-500 hover:text-indigo-700"
            >
              {showNames ? 'Amagar' : '✏️ Editar'}
            </button>
          </div>
          {showNames && (
            <div className="mt-3 space-y-2">
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {Array.from({ length: participantCount }, (_, i) => i + 1).map(num => (
                  <div key={num} className="flex items-center gap-2">
                    <span className="w-7 text-sm font-bold text-gray-400 shrink-0">#{num}</span>
                    <input
                      type="text"
                      value={participantNames[num] ?? ''}
                      onChange={(e) => setParticipantNames(prev => ({ ...prev, [num]: e.target.value }))}
                      placeholder="Nom (opcional)"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveNames}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 mt-1"
              >
                {isSubmitting ? 'Desant...' : 'Desar noms'}
              </button>
            </div>
          )}
        </div>

        {/* Zona de perill */}
        <div className="bg-red-50 rounded-2xl p-5 border-2 border-red-200">
          <p className="text-sm font-semibold text-red-600 mb-3">⚠️ Zona de perill</p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl text-red-600 font-bold border-2 border-red-400 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
            >
              Resetejar totes les votacions
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-700 font-medium text-center">Segur? Això no es pot desfer.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="py-3 rounded-xl font-bold text-gray-600 bg-white border-2 border-gray-300 hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  onClick={() => { setConfirmReset(false); handleReset() }}
                  disabled={isSubmitting}
                  className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Sí, resetejar'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

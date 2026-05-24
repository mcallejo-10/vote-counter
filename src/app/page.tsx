'use client'

import { useState, useEffect } from 'react'
import { toast, Toaster } from 'react-hot-toast'

export default function Home() {
  const [selectedVotes, setSelectedVotes] = useState<number[]>([])
  const [isVotingOpen, setIsVotingOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [participantCount, setParticipantCount] = useState(12)
  const [nameMap, setNameMap] = useState<Map<number, string>>(new Map())
  const [contestName, setContestName] = useState('Talent Xou')
  const [hasVoted, setHasVoted] = useState(false)
  const [votedNumbers, setVotedNumbers] = useState<number[]>([])
  const [isReturning, setIsReturning] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const [statusRes, participantsRes] = await Promise.all([
          fetch('/api/voting-status'),
          fetch('/api/participants'),
        ])
        const statusData = await statusRes.json()
        const participantsData = await participantsRes.json()
        setIsVotingOpen(statusData.isOpen)
        setParticipantCount(statusData.participantCount)
        if (statusData.contestName) setContestName(statusData.contestName)
        const map = new Map<number, string>(
          (participantsData.participants ?? []).map((p: { number: number; name: string }) => [p.number, p.name])
        )
        setNameMap(map)
      } catch (error) {
        console.error('Error al verificar estado de votación:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const handleVoteSelect = (number: number) => {
    setSelectedVotes(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number)
      }
      if (prev.length >= 3) {
        toast.error('Només pots seleccionar 3 números!')
        return prev
      }
      return [...prev, number]
    })
  }

  const handleSubmit = async () => {
    if (selectedVotes.length < 3) {
      toast.error('Has de seleccionar exactament 3 números per votar')
      return
    }

    setIsSubmitting(true)
    try {
      const statusResponse = await fetch('/api/voting-status')
      const statusData = await statusResponse.json()
      
      if (!statusData.isOpen) {
        setIsVotingOpen(false)
        toast.error('Les votacions estan tancades')
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
        setVotedNumbers([...selectedVotes])
        setHasVoted(true)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al registrar els vots')
      }
    } catch (error) {
      toast.error('Error al enviar los votos')
      console.error('Error al enviar los votos:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#E8178A' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  if (hasVoted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: '#E8178A' }}>
        <div className="text-center max-w-xs mx-auto">
          <h1 className="text-5xl font-black uppercase text-white mb-1" style={{ textShadow: '3px 3px 0px #000' }}>
            Gràcies!
          </h1>
          <p className="text-yellow-300 font-black text-lg uppercase mb-8" style={{ textShadow: '1px 1px 0px #000' }}>
            Vots registrats
          </p>
          <div className="flex flex-col items-center gap-3 mb-8">
            {votedNumbers.sort((a, b) => a - b).map(num => (
              <div
                key={num}
                className="w-56 flex items-center gap-4 bg-cyan-400 border-[3px] border-black rounded-xl px-4 py-3 font-black"
                style={{ boxShadow: '3px 3px 0px #000' }}
              >
                <span className="text-4xl leading-none w-10 text-center shrink-0">{num}</span>
                {nameMap.get(num) && (
                  <span className="text-base leading-tight text-left">{nameMap.get(num)}</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              if (isReturning) return
              setIsReturning(true)
              setTimeout(() => { window.location.href = '/' }, 1500)
            }}
            className={`text-sm font-bold px-6 py-3 rounded-xl border-[3px] border-black transition-all ${
              isReturning
                ? 'bg-white text-gray-400 cursor-wait'
                : 'bg-black text-yellow-400 hover:bg-gray-900 active:scale-95'
            }`}
            style={!isReturning ? { boxShadow: '3px 3px 0px rgba(255,255,255,0.3)' } : {}}
          >
            {isReturning ? 'Tornant...' : 'Tornar a les votacions →'}
          </button>
        </div>
      </main>
    )
  }

  if (!isVotingOpen) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{ background: '#E8178A' }}>
        <div className="text-center">
          <h1 className="text-5xl font-black mb-4 uppercase text-white" style={{ textShadow: '3px 3px 0px #000' }}>
            {contestName}<br />Tancat
          </h1>
          <p className="text-pink-100 font-bold">Les votacions no estan disponibles en aquests moments.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto" style={{ background: '#E8178A' }}>
      <Toaster position="top-center" />

      <div className="text-center mb-6 pt-2">
        <h1 className="text-3xl font-black uppercase text-white leading-tight" style={{ textShadow: '2px 2px 0px #000' }}>
          Votació
        </h1>
        <h2 className="text-2xl font-black uppercase text-yellow-300" style={{ textShadow: '2px 2px 0px #000' }}>
          {contestName}
        </h2>
      </div>

      <div className="mb-6">
        <p className="text-center text-base mb-4 text-white font-bold">
          Selecciona els 3 que més t’han agradat
          <br />
          <span className="text-pink-200 text-sm font-semibold">
            ({3 - selectedVotes.length} pendents de seleccionar)
          </span>
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(participantCount)].map((_, i) => {
            const num = i + 1
            const name = nameMap.get(num)
            const selected = selectedVotes.includes(num)
            return (
              <button
                key={num}
                onClick={() => handleVoteSelect(num)}
                disabled={selectedVotes.length >= 3 && !selected}
                className={`
                  min-h-20 flex flex-col items-center justify-center gap-1 py-3 px-1
                  rounded-xl border-[3px] border-black font-black
                  transition-all transform active:scale-95
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${selected
                    ? 'bg-cyan-400 text-black'
                    : 'bg-white text-black hover:bg-yellow-200'
                  }
                `}
                style={selected ? { boxShadow: '3px 3px 0px #000' } : { boxShadow: '3px 3px 0px rgba(0,0,0,0.4)' }}
              >
                <span className="text-2xl font-black leading-none">{num}</span>
                {name && (
                  <span className="text-xs leading-tight text-center w-full break-words px-1 line-clamp-2 font-bold">{name}</span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedVotes.length !== 3 || isSubmitting}
          className={`
            w-full py-4 px-6 rounded-xl
            font-black text-xl uppercase tracking-wide
            border-[3px] border-black
            transition-all
            ${selectedVotes.length === 3
              ? 'bg-black text-yellow-400 hover:bg-gray-900'
              : 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
            }
            ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
          `}
          style={selectedVotes.length === 3 ? { boxShadow: '4px 4px 0px rgba(255,255,255,0.3)' } : {}}
        >
          {isSubmitting ? 'Enviant...' : 'Enviar Vots'}
        </button>
      </div>
    </main>
  )
}

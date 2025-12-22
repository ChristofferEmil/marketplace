'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // 🔑 VIGTIGT: saml recovery-session op fra URL
  useEffect(() => {
    const handleRecovery = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      })

      if (error) {
        setError('Reset-link er ugyldigt eller udløbet')
        return
      }

      if (data?.session) {
        setReady(true)
      }
    }

    handleRecovery()
  }, [])

  async function updatePassword(e) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (error) {
    return (
      <main className="page">
        <h1>Kunne ikke nulstille adgangskode</h1>
        <p>{error}</p>
        <a href="/login">Tilbage til login</a>
      </main>
    )
  }

  if (done) {
    return (
      <main className="page">
        <h1>Adgangskode opdateret ✅</h1>
        <a href="/login">Log ind</a>
      </main>
    )
  }

  if (!ready) {
    return (
      <main className="page">
        <p>Validerer reset-link…</p>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Vælg ny adgangskode</h1>

      <form onSubmit={updatePassword}>
        <input
          type="password"
          placeholder="Ny adgangskode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">
          Opdater adgangskode
        </button>
      </form>
    </main>
  )
}

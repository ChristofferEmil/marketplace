'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function updatePassword(e) {
    e.preventDefault()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main className="page">
        <h1>Adgangskode opdateret ✅</h1>
        <a href="/login">Log ind</a>
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

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

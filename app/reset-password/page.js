'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Ugyldigt eller udløbet reset-link')
      } else {
        setReady(true)
      }
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    const { error } = await supabase.auth.resetPasswordForEmail(email)


    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (error) {
    return (
      <main className="page">
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
    return <main className="page"><p>Validerer link…</p></main>
  }

  return (
    <main className="page">
      <h1>Vælg ny adgangskode</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Ny adgangskode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Opdater adgangskode</button>
      </form>
    </main>
  )
}

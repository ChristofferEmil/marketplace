'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function emailPasswordLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // prøv login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // hvis user ikke findes → opret
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
    }

    window.location.href = redirectTo
  }

  async function oauthLogin(provider) {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}${redirectTo}`,
      },
    })
  }

  return (
    <main className="page" style={{ padding: 24 }}>
      <h1>Log ind</h1>

      <button onClick={() => oauthLogin('google')}>
        Fortsæt med Google
      </button>

      <button onClick={() => oauthLogin('facebook')}>
        Fortsæt med Facebook
      </button>

      <hr style={{ margin: '24px 0' }} />

      <form onSubmit={emailPasswordLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Adgangskode"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logger ind…' : 'Log ind / Opret konto'}
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </main>
  )
}

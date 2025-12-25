'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') 
  // mode: 'login' | 'reset'

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1️⃣ Prøv login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    // 2️⃣ Hvis user ikke findes → opret
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

  async function handleResetPassword() {
    if (!email) {
      setError('Indtast din email først')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email)



    if (error) {
      setError(error.message)
    } else {
      setError('Tjek din mail for reset-link ✉️')
    }

    setLoading(false)
  }

  return (
    <main className="page" style={{ padding: 24 }}>
      <h1>
        {mode === 'login' ? 'Log ind' : 'Nulstil adgangskode'}
      </h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode === 'login' && (
          <input
            type="password"
            placeholder="Adgangskode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        {mode === 'login' ? (
          <button type="submit" disabled={loading}>
            {loading ? 'Logger ind…' : 'Log ind / Opret konto'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? 'Sender…' : 'Send reset-link'}
          </button>
        )}

        {error && (
          <p style={{ marginTop: 12, color: error.includes('Tjek') ? 'green' : 'red' }}>
            {error}
          </p>
        )}
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'reset' : 'login')
          setError('')
        }}
        style={{
          marginTop: 16,
          background: 'none',
          border: 'none',
          color: 'blue',
          cursor: 'pointer',
        }}
      >
        {mode === 'login'
          ? 'Glemt adgangskode?'
          : 'Tilbage til login'}
      </button>
    </main>
  )
}

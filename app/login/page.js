'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const login = async () => {
    if (!email) return

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    setSent(true)
  }

  return (
    <main style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h1>Log ind</h1>

      {sent ? (
        <p>Tjek din email for login-link ✉️</p>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 10 }}
          />

          <button onClick={login}>Send login-link</button>
        </>
      )}
    </main>
  )
}

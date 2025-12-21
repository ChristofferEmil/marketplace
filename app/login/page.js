'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const login = async () => {
    const { error } = await supabase.auth.signInAnonymously()

    if (!error) {
      router.push('/')
    } else {
      console.error(error)
      alert('Login failed')
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginBottom: 16 }}>Welcome</h1>

      <button
        onClick={login}
        style={{
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Continue
      </button>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Hvis user allerede findes → videre
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.push('/')
      }
    })
  }, [router])

  const login = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInAnonymously()

    if (error) {
      console.error(error)
      alert('Login failed')
      setLoading(false)
      return
    }

    // 👇 DOBBELT-SIKRING
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      router.push('/')
    } else {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginBottom: 16 }}>Welcome</h1>

      <button
        onClick={login}
        disabled={loading}
        style={{
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--accent)',
          color: 'white',
          fontWeight: 500,
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Signing in…' : 'Continue'}
      </button>
    </main>
  )
}

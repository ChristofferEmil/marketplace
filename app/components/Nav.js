'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          CardSwap
        </Link>

        <div className="nav-links">
          <Link href="/listings">Listings</Link>
          <Link href="/create">Create</Link>

          {!user ? (
            <Link href="/login" style={{ opacity: 0.8 }}>
              Guest · Login
            </Link>
          ) : (
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Nav() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          Marketplace
        </Link>

        <div className="nav-links">
          <Link href="/listings">Listings</Link>

          {user && <Link href="/create">Create</Link>}

          {!user ? (
            <Link href="/login">Login</Link>
          ) : (
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                fontSize: 14,
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

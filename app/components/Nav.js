'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

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
    <>
      {/* TOP NAV (DESKTOP) */}
      <nav className="nav nav-top">
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

      {/* BOTTOM NAV (MOBILE) */}
      <nav className="bottom-nav">
        <Link
          href="/"
          className={`tab ${pathname === '/' ? 'active' : ''}`}
        >
          <span>🏠</span>
        </Link>

        <Link
          href="/search"
          className={`tab ${pathname === '/search' ? 'active' : ''}`}
        >
          <span>🔍</span>
        </Link>

        {/* CREATE (CENTER) */}
        <Link href="/create" className="tab tab-create">
          <span>＋</span>
        </Link>

        <Link
          href="/listings"
          className={`tab ${
            pathname.startsWith('/listings') ? 'active' : ''
          }`}
        >
          <span>🗂</span>
        </Link>

        {!user ? (
          <Link
            href="/login"
            className={`tab ${pathname === '/login' ? 'active' : ''}`}
          >
            <span>👤</span>
          </Link>
        ) : (
          <button onClick={logout} className="tab">
            <span>🚪</span>
          </button>
        )}
      </nav>
    </>
  )
}

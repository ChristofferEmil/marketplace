'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
  }

  const NavLinks = () => (
    <>
      <Link href="/" className={pathname === '/' ? 'active' : ''}>
        Home
      </Link>

      <Link
        href="/listings"
        className={pathname.startsWith('/listings') ? 'active' : ''}
      >
        Listings
      </Link>

      <Link href="/create" className={pathname === '/create' ? 'active' : ''}>
        Create
      </Link>

      {!user ? (
        <Link href="/login" className={pathname === '/login' ? 'active' : ''}>
          Login
        </Link>
      ) : (
        <button onClick={logout}>Logout</button>
      )}
    </>
  )

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <nav className="nav nav-desktop">
        <div className="nav-logo">CardSwap</div>
        <div className="nav-links">
          <NavLinks />
        </div>
      </nav>

      {/* MOBILE TOP BAR */}
      <div className="mobile-topbar">
        <div className="mobile-logo">CardSwap</div>
        <button
          className="burger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {/* MOBILE SLIDE-IN MENU */}
      {menuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setMenuOpen(false)}
          />

          <aside className="mobile-menu">
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="mobile-menu-links">
              <NavLinks />
            </div>
          </aside>
        </>
      )}
    </>
  )
}

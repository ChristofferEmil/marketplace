'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const [user, setUser] = useState(null)
  const pathname = usePathname()

  const isListingDetail =
    pathname.startsWith('/listings/') && pathname !== '/listings'

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
      {/* ================= SIDEBAR NAV (DESKTOP) ================= */}
      <nav className="sidebar-nav">
        <Link href="/" className="sidebar-logo">
          CardSwap
        </Link>

        <ul className="sidebar-list">
          <li>
            <Link href="/listings" className={pathname === '/listings' ? 'active' : ''}>
              Listings
            </Link>
          </li>

          <li>
            <Link href="/create" className={pathname === '/create' ? 'active' : ''}>
              Create
            </Link>
          </li>

          <li className="sidebar-spacer" />

          {!user ? (
            <li>
              <Link href="/login">Login</Link>
            </li>
          ) : (
            <li>
              <button onClick={logout} className="sidebar-logout">
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* ================= BOTTOM NAV (MOBILE) ================= */}
      {!isListingDetail && (
        <nav className="bottom-nav">
          <Link href="/" className={`tab ${pathname === '/' ? 'active' : ''}`}>
            <HomeIcon />
          </Link>

          <Link
            href="/search"
            className={`tab ${pathname === '/search' ? 'active' : ''}`}
          >
            <SearchIcon />
          </Link>

          <Link href="/create" className="tab tab-create">
            <PlusIcon />
          </Link>

          <Link
            href="/listings"
            className={`tab ${
              pathname.startsWith('/listings') ? 'active' : ''
            }`}
          >
            <GridIcon />
          </Link>

          {!user ? (
            <Link
              href="/login"
              className={`tab ${pathname === '/login' ? 'active' : ''}`}
            >
              <UserIcon />
            </Link>
          ) : (
            <button onClick={logout} className="tab">
              <LogoutIcon />
            </button>
          )}
        </nav>
      )}
    </>
  )
}

/* ================= ICONS ================= */

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 21c1.5-4 14.5-4 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Nav() {
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState(null) // ✅ NY
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)

  // 🔔 hent antal ulæste
  const fetchNotifications = async (userId) => {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifCount(count || 0)
  }

  // 👤 hent username
  const fetchUsername = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    setUsername(data?.username ?? null)
  }

  useEffect(() => {
    // initial load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)

      if (data.user) {
        fetchNotifications(data.user.id)
        fetchUsername(data.user.id) // ✅ NY
      }
    })

    // auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchNotifications(session.user.id)
        fetchUsername(session.user.id) // ✅ NY
      } else {
        setNotifCount(0)
        setUsername(null)
      }
    })

    // 👂 lytter på notifications updates
    const handler = () => {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) fetchNotifications(data.user.id)
      })
    }

    window.addEventListener('notifications:updated', handler)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('notifications:updated', handler)
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
  }

  const NotificationIcon = () => (
    <Link href="/notifications" className="nav-icon" aria-label="Notifikationer">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>

      {notifCount > 0 && (
        <span className="notif-badge">{notifCount}</span>
      )}
    </Link>
  )

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

      {user && <NotificationIcon />}

      {/* 👤 PROFIL LINK */}
      {user && username && (
        <Link
          href={`/u/${username}`}
          className={pathname.startsWith('/u/') ? 'active' : ''}
        >
          Profil
        </Link>
      )}

      {!user ? (
  <>
    <Link
      href="/login"
      className={pathname === '/login' ? 'active' : ''}
    >
      Log ind
    </Link>

    <Link
      href="/signup"
      className={pathname === '/signup' ? 'active' : ''}
    >
      Opret konto
    </Link>
  </>
) : (
  <button onClick={logout}>Log ud</button>
)}


    </>
  )

  return (
    <>
      {/* DESKTOP */}
      <nav className="nav nav-desktop">
        <div className="nav-logo">CardSwap</div>
        <div className="nav-links">
          <NavLinks />
        </div>
      </nav>

      {/* MOBILE */}
      
      <div className="mobile-topbar">
        <div className="mobile-logo">CardSwap</div>
        <div className="mobile-topbar-right">
         {!user && (
  <>
    <Link href="/login" className="mobile-auth-btn">
      Log ind
    </Link>
    <Link
      href="/signup"
      className="mobile-auth-btn mobile-auth-btn-primary"
    >
      Opret
    </Link>
  </>
)}

          <button
            className="burger-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>
      

      
      
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

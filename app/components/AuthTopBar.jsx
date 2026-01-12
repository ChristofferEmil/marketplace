/*'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function AuthTopBar({ openAuth }) {
  const [user, setUser] = useState(null)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
      if (data?.user) fetchNotifications(data.user.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchNotifications(session.user.id)
      else setNotifCount(0)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchNotifications = async (userId) => {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifCount(count || 0)
  }

  return (
    <div className="auth-topbar">
      <Link href="/" className="auth-logo">
        CardSwap
      </Link>

      <div className="auth-actions">
        {!user && (
          <>
            <button
              className="auth-link"
              onClick={() => openAuth('login')}
            >
              Log ind
            </button>

            <button
              className="auth-primary"
              onClick={() => openAuth('signup')}
            >
              Opret konto
            </button>
          </>
        )}

        {user && (
          <Link href="/notifications" className="auth-avatar">
            <img
              src={user.user_metadata?.avatar_url || '/avatar-placeholder.png'}
              alt="Profil"
            />
            {notifCount > 0 && (
              <span className="auth-badge">{notifCount}</span>
            )}
          </Link>
        )}
      </div>
    </div>
  )
}

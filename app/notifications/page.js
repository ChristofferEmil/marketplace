'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function NotificationsPage() {
  const [user, setUser] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        setLoading(false)
        return
      }
      setUser(data.user)

      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          setItems(data || [])
          setLoading(false)
        })
    })
  }, [])

  async function markAsRead(id) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)

  setItems(prev =>
    prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
  )

  // 🔔 Fortæl navbar at count skal opdateres
  window.dispatchEvent(new Event('notifications:updated'))
}


  if (loading) {
    return <main className="page">Loader…</main>
  }

  if (!user) {
    return (
      <main className="page">
        <p>Log ind for at se notifikationer</p>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Notifikationer</h1>

      {items.length === 0 && <p>Ingen notifikationer</p>}

      <ul style={{ marginTop: 16 }}>
        {items.map(n => (
          <li
            key={n.id}
            style={{
              padding: 12,
              marginBottom: 8,
              borderRadius: 12,
              background: n.is_read ? '#1f2336' : '#2a2f45',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                Nyt spørgsmål på dit opslag
              </span>

              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  style={{ fontSize: 12 }}
                >
                  Markér som læst
                </button>
              )}
            </div>

            {n.listing_id && (
             <Link
  href={`/listings/${n.listing_id}`}
  onClick={() => {
    if (!n.is_read) {
      markAsRead(n.id)
    }
  }}
>
  <small>Gå til opslag →</small>
</Link>

            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

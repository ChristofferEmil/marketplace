'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function InboxPage() {
  const [user, setUser] = useState(null)
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      setUser(user)

      const { data, error } = await supabase
        .from('messages')
        .select('listing_id, listings(title)')
        .eq('sender_id', user.id)

      if (error) {
        console.error(error)
        return
      }

      const uniqueThreads = Object.values(
        data.reduce((acc, item) => {
          if (item.listings) {
            acc[item.listing_id] = item
          }
          return acc
        }, {})
      )

      setThreads(uniqueThreads)
    }

    load()
  }, [])

  if (!user) {
    return <p style={{ padding: 20 }}>Log ind for at se din inbox</p>
  }

  return (
    <main className="page">

      <h1>Inbox</h1>

      {threads.length === 0 && <p>Ingen beskeder endnu</p>}

      <ul>
        {threads.map(thread => (
          <li key={thread.listing_id}>
            <Link href={`/listings/${thread.listing_id}`}>
              {thread.listings?.title || 'Listing'}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

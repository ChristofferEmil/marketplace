'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ListingDetailPage() {
  const { id } = useParams()

  const [listing, setListing] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!id) return

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => setListing(data))

    supabase
      .from('messages')
      .select('*')
      .eq('listing_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages(data || []))
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!user || !text) return

    const { data } = await supabase
      .from('messages')
      .insert({
        listing_id: id,
        sender_id: user.id,
        content: text,
      })
      .select()
      .single()

    setMessages(prev => [...prev, data])
    setText('')
  }

  if (!listing) {
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page">

      {/* LISTING */}
      <div className="card card-detail">
        {listing.image_url && (
          <div className="card-image">
            <img src={listing.image_url} alt={listing.title} />
          </div>
        )}

        <div className="card-body">
          <h1>{listing.title}</h1>

          {listing.description && (
            <p>{listing.description}</p>
          )}
        </div>
      </div>

      {/* CHAT */}
      <div className="card card-detail" style={{ marginTop: 24 }}>
        <strong>Chat</strong>

        <div className="chat">
          {messages.map(m => (
            <div
              key={m.id}
              className={`bubble ${
                m.sender_id === user?.id ? 'me' : 'them'
              }`}
            >
              {m.content}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={
              user ? 'Write a message…' : 'Log in to chat'
            }
            disabled={!user}
          />

          <button
            onClick={send}
            disabled={!user || !text}
          >
            Send
          </button>
        </div>
      </div>

    </main>
  )
}

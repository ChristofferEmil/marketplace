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
    <main className="page page-detail">

      {/* IMAGE HERO */}
      {listing.image_url && (
        <div className="detail-image">
          <img src={listing.image_url} alt={listing.title} />
        </div>
      )}

     {/* DETAILS */}
<section className="detail-content">
  <h1>{listing.title}</h1>

  {/* TAGS */}
  <div className="detail-tags">
    {listing.series && <span className="tag">{listing.series}</span>}
    {listing.condition && <span className="tag">{listing.condition}</span>}

    {Array.isArray(listing.tags) &&
      listing.tags.map(tag => (
        <span key={tag} className="tag tag-muted">
          {tag}
        </span>
      ))}
  </div>

  {/* SALES INFO */}
  <div className="sale-box">
    {listing.claim_price && (
      <div className="sale-item">
        <span className="sale-label">Claim price</span>
        <strong>{listing.claim_price} kr</strong>
      </div>
    )}

    {listing.starting_bid && (
      <div className="sale-item">
        <span className="sale-label">Starting bid</span>
        <strong>{listing.starting_bid} kr</strong>
      </div>
    )}

    {listing.auction_ends_at && (
      <div className="sale-item">
        <span className="sale-label">Auction ends</span>
        <strong>
          {new Date(listing.auction_ends_at).toLocaleString()}
        </strong>
      </div>
    )}
  </div>

  {listing.description && (
    <p className="detail-description">
      {listing.description}
    </p>
  )}
</section>


      {/* CHAT */}
      <section className="card card-detail chat-card">
        <strong>Chat with seller</strong>

        <div className="chat chat-scroll">
          {messages.length === 0 && (
            <p className="chat-empty">
              No messages yet. Start the conversation 👋
            </p>
          )}

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
      </section>

      {/* STICKY INPUT */}
      <div className="chat-input chat-input-fixed">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={user ? 'Write a message…' : 'Log in to chat'}
          disabled={!user}
        />

        <button onClick={send} disabled={!user || !text}>
          Send
        </button>
      </div>
    </main>
  )
}

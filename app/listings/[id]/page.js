'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ListingDetailPage() {
  const { id } = useParams()
  const bottomRef = useRef(null)

  const [listing, setListing] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [user, setUser] = useState(null)

  const [isClaimed, setIsClaimed] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)

  const isOwner = user && listing && user.id === listing.user_id

  const isDesktop =
    typeof window !== 'undefined' && window.innerWidth >= 769
  const [showChat, setShowChat] = useState(isDesktop)

  /* ---------- LOAD DATA ---------- */
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

    supabase
      .from('claims')
      .select('id')
      .eq('listing_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsClaimed(true)
      })
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---------- CHAT ---------- */
  async function send() {
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

  /* ---------- CLAIM ---------- */
  async function handleClaim() {
    if (!user) {
      alert('Du skal være logget ind for at claime')
      return
    }

    setClaimLoading(true)

    const { error } = await supabase
      .from('claims')
      .insert({
        listing_id: id,
        claimer_id: user.id,
      })

    if (error) {
      alert(error.message)
    } else {
      setIsClaimed(true)
      alert('Kortet er nu claimed. Skriv til sælgeren i chatten.')
    }

    setClaimLoading(false)
  }

  if (!listing) {
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="page page-detail hide-bottom-nav">

      {/* IMAGE HERO */}
      {listing.image_url && (
        <div className="detail-image">
          <img src={listing.image_url} alt={listing.title} />
        </div>
      )}

      {/* DETAILS */}
      <section className="detail-content">
        <h1>{listing.title}</h1>

        <div className="detail-tags">
          {listing.series && <span className="tag">{listing.series}</span>}
          {listing.condition && (
            <span className="tag">{listing.condition}</span>
          )}

          {Array.isArray(listing.tags) &&
            listing.tags.map(tag => (
              <span key={tag} className="tag tag-muted">
                {tag}
              </span>
            ))}
        </div>

        <div className="sale-box">
          {listing.claim_price && (
            <div className="sale-item">
              <span className="sale-label">Claim price</span>
              <strong>{listing.claim_price} kr</strong>
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

      {/* CHAT INPUT */}
      {showChat && (
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
      )}

      {/* ACTION BAR */}
      {!showChat && (
        <div className="action-bar">
          <button
            className="action-btn secondary"
            onClick={() => setShowChat(true)}
          >
            Chat
          </button>

          <button
            className="action-btn primary"
            onClick={handleClaim}
            disabled={isOwner || isClaimed || claimLoading}
          >
            {isOwner
              ? 'Dit opslag'
              : isClaimed
              ? 'Allerede claimed'
              : claimLoading
              ? 'Claimer…'
              : 'Claim'}
          </button>
        </div>
      )}
    </main>
  )
}

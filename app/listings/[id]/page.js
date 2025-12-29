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

  const [questions, setQuestions] = useState([])
  const [questionText, setQuestionText] = useState('')

  const isDesktop =
    typeof window !== 'undefined' && window.innerWidth >= 769
  const [showChat, setShowChat] = useState(isDesktop)

  const isOwner = user && listing && user.id === listing.user_id

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

  /* ---------- LOAD Q&A ---------- */
  useEffect(() => {
    if (!listing?.id) return

    supabase
      .from('listing_questions')
      .select('*')
      .eq('listing_id', listing.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setQuestions(data || []))
  }, [listing?.id])

  /* ---------- SEND QUESTION ---------- */
  async function submitQuestion(e) {
    e.preventDefault()
    if (!questionText.trim() || !user) return

    const { error } = await supabase
      .from('listing_questions')
      .insert({
        listing_id: listing.id,
        user_id: user.id,
        text: questionText,
      })

    if (!error) {
      setQuestions(q => [
        ...q,
        {
          id: crypto.randomUUID(),
          text: questionText,
          created_at: new Date().toISOString(),
        },
      ])
      setQuestionText('')
    }
  }

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

    if (!error) {
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
      {/* IMAGE */}
      {listing.image_url && (
        <div className="detail-image">
          <img src={listing.image_url} alt={listing.title} />
        </div>
      )}

      {/* DETAILS */}
      <section className="detail-content">
        <h1>{listing.title}</h1>

        <p className="detail-description">{listing.description}</p>
      </section>

      {/* Q&A */}
      <section style={{ marginTop: 32 }}>
        <h3>Spørgsmål & svar</h3>

        {questions.length === 0 && <p>Ingen spørgsmål endnu</p>}

        {questions.map(q => (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <p>{q.text}</p>
            <small>
              {new Date(q.created_at).toLocaleDateString('da-DK')}
            </small>
          </div>
        ))}

        {user && (
          <form onSubmit={submitQuestion} style={{ marginTop: 16 }}>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Stil et offentligt spørgsmål…"
            />
            <button type="submit">Send spørgsmål</button>
          </form>
        )}
      </section>

      {/* CHAT */}
      <section className="card card-detail chat-card">
        <strong>Chat</strong>

        <div className="chat chat-scroll">
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
      <div className="chat-input chat-input-fixed">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={user ? 'Skriv besked…' : 'Log ind for at chatte'}
          disabled={!user}
        />
        <button onClick={send} disabled={!user || !text}>
          Send
        </button>
      </div>
    </main>
  )
}

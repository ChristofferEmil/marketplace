'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  const intervals = [
    { label: 'år', seconds: 31536000 },
    { label: 'mdr', seconds: 2592000 },
    { label: 'uge', seconds: 604800 },
    { label: 'dag', seconds: 86400 },
    { label: 't', seconds: 3600 },
    { label: 'min', seconds: 60 },
  ]

  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds)
    if (count >= 1) return `${count} ${i.label} siden`
  }
  return 'lige nu'
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const bottomRef = useRef(null)

  const [listing, setListing] = useState(null)
  const [user, setUser] = useState(null)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const [questions, setQuestions] = useState([])
  const [questionText, setQuestionText] = useState('')

  const [isClaimed, setIsClaimed] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)

  const isOwner = user && listing && user.id === listing.user_id

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!id) return

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
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
      .from('listing_questions')
      .select('*')
      .eq('listing_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => setQuestions(data || []))

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

 

  /* ---------- SUBMIT QUESTION ---------- */
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
          user_id: user.id,
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

  // 1️⃣ Opret claim FØRST
  const { error: claimError } = await supabase
    .from('claims')
    .insert({
      listing_id: id,
      claimer_id: user.id,
    })

  if (claimError) {
    console.error('Claim error:', claimError)
    alert('Kunne ikke claime opslaget')
    setClaimLoading(false)
    return
  }

  // 2️⃣ Opret notification TIL SÆLGER
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: listing.user_id, // 🔴 VIGTIGT: sælgerens id
      listing_id: id,
      type: 'claim',
      is_read: false,
    })

  if (notifError) {
    console.error('Notification error:', notifError)
  }

  setIsClaimed(true)
  alert('Kortet er nu claimed. Skriv til sælgeren i chatten.')
  setClaimLoading(false)
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
        {listing.description && (
          <p className="detail-description">{listing.description}</p>
        )}
      </section>

      {/* Q&A */}
      <section style={{ marginTop: 32 }}>
        <h3>Spørgsmål & svar</h3>

        

        {questions.length === 0 && <p>Ingen spørgsmål endnu</p>}

        {questions.map(q => {
          const isSeller = q.user_id === listing.user_id

          return (
            <div key={q.id} style={{ marginBottom: 12 }}>
              <p>{q.text}</p>

              <div style={{ display: 'flex', gap: 8 }}>
                <small>{timeAgo(q.created_at)}</small>
                {isSeller && <span className="badge">Sælger</span>}
              </div>
            </div>
          )
        })}

        {user && !isClaimed ? (
          <form onSubmit={submitQuestion}>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows={3}
              placeholder="Stil et offentligt spørgsmål…"
            />
            <button type="submit">Send spørgsmål</button>
          </form>
        ) : (
         <p style={{ opacity: 0.7 }}>
  Opslaget er solgt – Q&A er lukket.
</p>

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

      {/* CLAIM */}
      <div style={{ marginTop: 16 }}>
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
    </main>
  )
}

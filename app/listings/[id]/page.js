'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

/* ---------------- TIME AGO ---------------- */
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

/* ---------------- PAGE ---------------- */
export default function ListingDetailPage() {
  const { id } = useParams()
  const bottomRef = useRef(null)

  /* ---------- STATE ---------- */
  const [listing, setListing] = useState(null)
  const [user, setUser] = useState(null)

  const [items, setItems] = useState([])

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const [questions, setQuestions] = useState([])
  const [questionText, setQuestionText] = useState('')

  const [isClaimed, setIsClaimed] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)

  const isOwner = user && listing && user.id === listing.user_id


const [selectedItems, setSelectedItems] = useState([])


// =======================
// TOGGLE CARD SELECTION
// =======================
function toggleItem(item) {
  setSelectedItems(prev => {
    const exists = prev.find(i => i.id === item.id)

    if (exists) {
      // fjern kort
      return prev.filter(i => i.id !== item.id)
    }

    // tilføj kort
    return [...prev, item]
  })
}


  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!id) return

    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      setUser(auth?.user ?? null)

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      setListing(listingData)

      const { data: itemData } = await supabase
  .from('listing_items')
  .select('*')
  .eq('listing_id', id)
  .order('card_number', { ascending: true })


      setItems(itemData || [])

      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', id)
        .order('created_at')

      setMessages(msgData || [])

      const { data: qData } = await supabase
        .from('listing_questions')
        .select('*')
        .eq('listing_id', id)
        .order('created_at')

      setQuestions(qData || [])

      const { data: claim } = await supabase
        .from('claims')
        .select('id')
        .eq('listing_id', id)
        .maybeSingle()

      setIsClaimed(!!claim)
    }

    load()
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])



 /* ---------- CHAT ---------- */
async function send() {
  if (!user || !text) return

  const finalMessage = buildFinalMessage()
  console.log(finalMessage)

  const { data } = await supabase
    .from('messages')
    .insert({
      listing_id: id,
      sender_id: user.id,
      content: finalMessage,
    })
    .select()
    .single()

  if (data) {
    setMessages(prev => [...prev, data])
    setText('')
    setSelectedItems([]) // ryd valgte kort
  }
}







  /* ---------- QUESTION ---------- */
  async function submitQuestion(e) {
    e.preventDefault()
    if (!questionText.trim() || !user || !listing) return

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




  /* ---------- CLAIM ---------- */
  async function handleClaim() {
    if (!user || !listing) return

    setClaimLoading(true)

    const { error } = await supabase.from('claims').insert({
      listing_id: id,
      claimer_id: user.id,
    })

    if (error) {
      alert('Kunne ikke claime opslaget')
      setClaimLoading(false)
      return
    }

    await supabase.from('notifications').insert({
      user_id: listing.user_id,
      listing_id: id,
      type: 'claim',
      is_read: false,
    })

    setIsClaimed(true)
    setClaimLoading(false)
  }


  function buildFinalMessage() {
  if (selectedItems.length === 0) {
    return text
  }

  const itemsText = selectedItems
  .map(it => {
    const number = it.card_number ? `#${it.card_number} ` : ''
    return `• ${number}${it.name}`
  })
  .join('\n')

return `${text}\n\nValgte kort:\n${itemsText}`
}



  /* ---------- GUARD ---------- */
  if (!listing) {
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    )
  }

  /* ---------- UI ---------- */
  return (
    <main className="page page-detail hide-bottom-nav">
      {listing.image_url && (
        <div className="detail-image">
          <img src={listing.image_url} alt={listing.title} />
        </div>
      )}

      <section className="detail-content">
        <h1>{listing.title}</h1>
        {listing.description && (
          <p className="detail-description">{listing.description}</p>
        )}
      </section>

      {/* -------- CARD LIST -------- */}
      {items.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h3>Kort i opslaget</h3>

          {items.map(it => (
            <label
              key={it.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 60px 1fr auto',
                gap: 8,
                alignItems: 'center',
                padding: '6px 0',
              }}
            >
             <input
  type="checkbox"
  checked={selectedItems.some(i => i.id === it.id)}
  onChange={() => toggleItem(it)}
/>


              <span>{it.card_number || '-'}</span>
              <span>{it.name}</span>
              {it.price && <strong>{it.price} kr.</strong>}
            </label>
          ))}
        </section>
      )}

      {/* -------- Q&A -------- */}
      <section style={{ marginTop: 32 }}>
        <h3>Spørgsmål & svar</h3>

        {questions.length === 0 && <p>Ingen spørgsmål endnu</p>}

        {questions.map(q => (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <p>{q.text}</p>
            <small>{timeAgo(q.created_at)}</small>
          </div>
        ))}

        {user && !isClaimed && (
          <form onSubmit={submitQuestion}>
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

      {/* -------- CHAT -------- */}
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

      <button
        className="action-btn primary"
        onClick={handleClaim}
        disabled={isOwner || isClaimed || claimLoading}
      >
        {isOwner ? 'Dit opslag' : isClaimed ? 'Allerede claimed' : 'Claim'}
      </button>
    </main>
  )
}

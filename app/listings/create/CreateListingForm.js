'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

/* =====================================================
   KONSTANTER (kan udvides senere)
===================================================== */
const TAGS = ['Holo', 'Reverse', '1st Edition', 'Shadowless', 'Promo']

/* =====================================================
   COMPONENT
===================================================== */
export default function CreateListingForm({
  mode = 'create',
  initialData = null,
  listingId = null,
  onSaved,
}) {
  const router = useRouter()

  /* =====================================================
     STATE – GENERELT
  ===================================================== */
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [image, setImage] = useState(null)
  const [tags, setTags] = useState(initialData?.tags ?? [])

  /* =====================================================
     STATE – KORT I OPSLAGET (VIGTIG DEL)
     👇 HER skal AI senere skrive til
  ===================================================== */
  const [items, setItems] = useState([
    { card_number: '', name: '', condition: '',price: '' },
  ])

  /* =====================================================
     KORT-HJÆLPEFUNKTIONER
     (bruges i UI og submit)
  ===================================================== */
  const addItem = () =>
    setItems(prev => [...prev, { card_number: '', name: '', price: '' }])

  const removeItem = idx =>
    setItems(prev => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, key, value) =>
    setItems(prev =>
      prev.map((it, i) =>
        i === idx ? { ...it, [key]: value } : it
      )
    )

  /* =====================================================
     SUBMIT
  ===================================================== */
  const submit = async e => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    // 🔐 Auth check
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      alert('You must be logged in')
      setSaving(false)
      return
    }

    /* ---------- IMAGE UPLOAD ---------- */
    let image_url = initialData?.image_url ?? null

    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      const { error } = await supabase.storage
        .from('listings')
        .upload(fileName, image)

      if (error) {
        alert('Image upload failed')
        setSaving(false)
        return
      }

      const { data } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName)

      image_url = data.publicUrl
    }

    /* ---------- LISTING ---------- */
    const payload = {
      title,
      description,
      image_url,
      tags: tags.length ? tags : null,
    }

    const query =
      mode === 'edit'
        ? supabase.from('listings').update(payload).eq('id', listingId)
        : supabase.from('listings').insert({
            ...payload,
            user_id: session.user.id,
          })

    const { data, error } = await query.select().single()

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    /* ---------- LISTING ITEMS (KORT) ---------- */
    if (items.length) {
      await supabase.from('listing_items').insert(
        items.map(it => ({
          listing_id: data.id,
          card_number: it.card_number || null,
          name: it.name,
          price: it.price ? Number(it.price) : null,
          condition: it.condition || null,
        }))
      )
    }

    onSaved ? onSaved(data) : router.push(`/listings/${data.id}`)
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="form-card">
      <h1>{mode === 'edit' ? 'Rediger opslag' : 'Opret opslag'}</h1>

      <form onSubmit={submit}>
        {/* BASISTEKST */}
        <input
          placeholder="Titel"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Beskrivelse"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* BILLEDE */}
        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
        />

        {/* TAGS */}
        <div className="chip-group">
          {TAGS.map(t => (
            <button
              key={t}
              type="button"
              className={`chip ${tags.includes(t) ? 'active' : ''}`}
              onClick={() =>
                setTags(prev =>
                  prev.includes(t)
                    ? prev.filter(x => x !== t)
                    : [...prev, t]
                )
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* =============================
            KORT-LISTE (CENTRAL DEL)
           ============================= */}
        <h3>Kort i opslaget</h3>

        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px auto',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <input
              placeholder="#"
              value={it.card_number}
              onChange={e =>
                updateItem(idx, 'card_number', e.target.value)
              }
            />

            <input
              placeholder="Kortnavn"
              value={it.name}
              onChange={e =>
                updateItem(idx, 'name', e.target.value)
              }
              required
            />

            <input
  type="text"
  placeholder="Stand (fx EX, LP, NM)"
  value={it.condition || ''}
  onChange={e =>
    updateItem(idx, 'condition', e.target.value)
  }
/>



            <input
              placeholder="Pris"
              type="number"
              value={it.price}
              onChange={e =>
                updateItem(idx, 'price', e.target.value)
              }
            />

            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)}>
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem}>
          + Tilføj kort
        </button>

        <button className="submit-btn" disabled={saving}>
          {saving ? 'Gemmer…' : 'Opret opslag'}
        </button>
      </form>
    </div>
  )
}

'use client'

/* =====================================================
   IMPORTS
===================================================== */
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
     STATE – GENERELT OPSLAG
  ===================================================== */
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [image, setImage] = useState(null)
  const [tags, setTags] = useState(initialData?.tags ?? [])

  /* =====================================================
     STATE – KORT I OPSLAGET (DET VIGTIGE FUNDAMENT)
     👉 HVER LINJE = ÉT KORT
     👉 HER SKAL AI / SCANNING SENERE IND
  ===================================================== */
  const [items, setItems] = useState([
    { card_number: '', name: '', price: '' },
  ])

  /* =====================================================
     HELPERS – TAGS
  ===================================================== */
  const toggleTag = tag =>
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )

  /* =====================================================
     HELPERS – KORT-LINJER (ITEMS)
     👉 Brug disse når vi senere:
       - indsætter AI-resultater
       - retter kort manuelt
       - tilføjer stand, sprog m.m.
  ===================================================== */
  const addItem = () =>
    setItems(prev => [
      ...prev,
      { card_number: '', name: '', price: '' },
    ])

  const removeItem = index =>
    setItems(prev => prev.filter((_, i) => i !== index))

  const updateItem = (index, field, value) =>
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )

  /* =====================================================
     SUBMIT – OPRET OPSLAG + GEM KORT
  ===================================================== */
  const submit = async e => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    /* ---------- AUTH CHECK ---------- */
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

      image_url =
        supabase.storage.from('listings')
          .getPublicUrl(fileName).data.publicUrl
    }

    /* ---------- OPRET LISTING ---------- */
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        image_url,
        tags,
        user_id: session.user.id,
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    /* ---------- GEM KORTENE (listing_items) ---------- */
    await supabase.from('listing_items').insert(
      items.map(item => ({
        listing_id: data.id,
        card_number: item.card_number || null,
        name: item.name,
        price: item.price ? Number(item.price) : null,
      }))
    )

    /* ---------- REDIRECT ---------- */
    onSaved
      ? onSaved(data)
      : router.push(`/listings/${data.id}`)
  }

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div className="form-card">
      <h1>Create listing</h1>

      <form onSubmit={submit}>
        {/* ---------- BASIS INFO ---------- */}
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

        <input
          type="file"
          accept="image/*"
          onChange={e => setImage(e.target.files[0])}
        />

        {/* ---------- TAGS ---------- */}
        <div className="chip-group">
          {TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              className={`chip ${tags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* =================================================
           KORT-LISTE (CENTRAL DEL AF PLATFORMEN)
           👉 Hver række = ét kort
           👉 Her kommer AI-forslag senere
        ================================================= */}
        <h3>Kort i opslaget</h3>

        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px auto',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <input
              placeholder="#"
              value={item.card_number}
              onChange={e =>
                updateItem(index, 'card_number', e.target.value)
              }
            />

            <input
              placeholder="Kortnavn"
              value={item.name}
              onChange={e =>
                updateItem(index, 'name', e.target.value)
              }
              required
            />

            <input
              placeholder="Pris"
              type="number"
              value={item.price}
              onChange={e =>
                updateItem(index, 'price', e.target.value)
              }
            />

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem}>
          + Tilføj kort
        </button>

        {/* ---------- SUBMIT ---------- */}
        <button className="submit-btn" disabled={saving}>
          {saving ? 'Gemmer…' : 'Create listing'}
        </button>
      </form>
    </div>
  )
}

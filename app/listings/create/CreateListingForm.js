'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const SERIES = [
  'Base Set',
  'Jungle',
  'Fossil',
  'Team Rocket',
  'Neo Genesis',
  'Neo Discovery',
  'Neo Revelation',
  'Neo Destiny',
]

const CONDITIONS = ['MT', 'NM', 'EX', 'GD', 'LP', 'PL', 'PO']
const TAGS = ['Holo', 'Reverse', '1st Edition', 'Shadowless', 'Promo']



export default function CreateListingForm({
  mode = 'create',
  initialData = null,
  listingId = null,
  onSaved,
}) {
  const router = useRouter()

const [saving, setSaving] = useState(false)
  const [changeImage, setChangeImage] = useState(false)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [image, setImage] = useState(null)

  const [series, setSeries] = useState(initialData?.series ?? [])
  const [condition, setCondition] = useState(initialData?.condition ?? '')
  const [tags, setTags] = useState(initialData?.tags ?? [])

  const [allowClaim, setAllowClaim] = useState(initialData?.allow_claim ?? false)
  const [allowAuction, setAllowAuction] = useState(initialData?.allow_auction ?? false)

  const [claimPrice, setClaimPrice] = useState(initialData?.claim_price ?? '')
  const [startingBid, setStartingBid] = useState(initialData?.starting_bid ?? '')
  const [auctionEnd, setAuctionEnd] = useState(
    initialData?.auction_ends_at
      ? initialData.auction_ends_at.slice(0, 16)
      : ''
  )


  const [items, setItems] = useState([
  { card_number: '', name: '', price: '' },
])


  const toggleSeries = s =>
    setSeries(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )

  const toggleTag = t =>
    setTags(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )

 const submit = async e => {
  e.preventDefault()
  if (saving) return

  setSaving(true)

  const {
  data: { session },
} = await supabase.auth.getSession()

if (!session?.user) {
  alert('You must be logged in')
  setSaving(false)
  return
}

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

    const payload = {
      title,
      description,
      image_url,
      series: series.length ? series : null,
      condition: condition || null,
      tags: tags.length ? tags : null,
      allow_claim: allowClaim,
      claim_price: allowClaim ? Number(claimPrice) : null,
      allow_auction: allowAuction,
      starting_bid: allowAuction ? Number(startingBid) : null,
      auction_ends_at: allowAuction ? new Date(auctionEnd).toISOString() : null,
    }

    const query =
      mode === 'edit'
        ? supabase.from('listings').update(payload).eq('id', listingId)
        : supabase.from('listings').insert({
            ...payload,
            user_id: session.user.id,
          })

    const { data, error } = await query.select().single()




// 📦 Kort-linjer (items)
const [items, setItems] = useState([
  { card_number: '', name: '', price: '' },
])

const addItem = () =>
  setItems(prev => [...prev, { card_number: '', name: '', price: '' }])

const removeItem = (idx) =>
  setItems(prev => prev.filter((_, i) => i !== idx))

const updateItem = (idx, key, value) =>
  setItems(prev =>
    prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
  )






    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }


// 🧾 Gem kortene i listing_items
await supabase.from('listing_items').insert(
  items.map(it => ({
    listing_id: data.id,      // 👈 ID på opslaget
    card_number: it.card_number || null,
    name: it.name,
    price: it.price ? Number(it.price) : null,
  }))
)



    onSaved
      ? onSaved(data)
      : router.push(`/listings/${data.id}`)
  }

  return (
    <div className="form-card">
      <h1>{mode === 'edit' ? 'Rediger opslag' : 'Create listing'}</h1>

      <form onSubmit={submit}>
        <input value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea value={description} onChange={e => setDescription(e.target.value)} />



        {mode === 'edit' && initialData?.image_url && (
  <div style={{ marginBottom: 12 }}>
    <img
      src={initialData.image_url}
      alt="Nuværende billede"
      style={{ maxWidth: '100%', borderRadius: 8 }}
    />

    {!changeImage ? (
      <button
        type="button"
        onClick={() => setChangeImage(true)}
        style={{ marginTop: 8 }}
      >
        Skift billede
      </button>
    ) : (
      <button
        type="button"
        onClick={() => {
          setChangeImage(false)
          setImage(null)
        }}
        style={{ marginTop: 8 }}
      >
        Annuller
      </button>
    )}
  </div>
)}

{(mode === 'create' || changeImage) && (
  <div style={{ marginBottom: 12 }}>
    <input
      type="file"
      accept="image/*"
      onChange={e => setImage(e.target.files[0])}
    />
  </div>
)}



        <div className="chip-group">
          {TAGS.map(t => (
            <button
              key={t}
              type="button"
              className={`chip ${tags.includes(t) ? 'active' : ''}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>


{/* 🧾 Kort-liste */}
<div style={{ marginTop: 12 }}>
  <h3>Kort i opslaget</h3>

  {items.map((it, idx) => (
    <div
      key={idx}
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 8,
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <input
        placeholder="#nr"
        value={it.card_number}
        onChange={e => updateItem(idx, 'card_number', e.target.value)}
        style={{ maxWidth: 80 }}
      />

      <input
        placeholder="Kortnavn"
        value={it.name}
        onChange={e => updateItem(idx, 'name', e.target.value)}
        required
      />

      <input
        placeholder="Pris"
        type="number"
        value={it.price}
        onChange={e => updateItem(idx, 'price', e.target.value)}
        style={{ maxWidth: 90 }}
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
</div>



<h3>Kort i opslag</h3>

{items.map((it, i) => (
  <div key={i} style={{ display: 'flex', gap: 8 }}>
    <input
      placeholder="#"
      value={it.card_number}
      onChange={e => {
        const copy = [...items]
        copy[i].card_number = e.target.value
        setItems(copy)
      }}
      style={{ width: 60 }}
    />

    <input
      placeholder="Kortnavn"
      value={it.name}
      onChange={e => {
        const copy = [...items]
        copy[i].name = e.target.value
        setItems(copy)
      }}
      required
    />

    <input
      placeholder="Pris (valgfri)"
      value={it.price}
      onChange={e => {
        const copy = [...items]
        copy[i].price = e.target.value
        setItems(copy)
      }}
      style={{ width: 100 }}
    />
  </div>
))}

<button
  type="button"
  onClick={() =>
    setItems([...items, { card_number: '', name: '', price: '' }])
  }
>
  + Tilføj kort
</button>




        <button className="submit-btn" disabled={saving}>
  {saving
    ? 'Gemmer…'
    : mode === 'edit'
      ? 'Gem ændringer'
      : 'Create listing'}
</button>

      </form>
    </div>
  )
}

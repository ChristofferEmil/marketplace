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

    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) {
      alert('You must be logged in')
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
            user_id: auth.user.id,
          })

    const { data, error } = await query.select().single()

    if (error) {
      alert(error.message)
      return
    }

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

        <button className="submit-btn">
          {mode === 'edit' ? 'Gem ændringer' : 'Create listing'}
        </button>
      </form>
    </div>
  )
}

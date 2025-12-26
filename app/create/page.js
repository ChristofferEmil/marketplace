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

const CONDITIONS = ['NM', 'EX', 'VG', 'LP']
const TAGS = ['Holo', 'Reverse', '1st Edition', 'Shadowless', 'Promo']

export default function CreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)

  // ✅ SERIES SOM ARRAY (0, 1 eller flere)
  const [series, setSeries] = useState([])

  const [condition, setCondition] = useState('')
  const [tags, setTags] = useState([])

  const [allowClaim, setAllowClaim] = useState(false)
  const [allowAuction, setAllowAuction] = useState(false)

  const [claimPrice, setClaimPrice] = useState('')
  const [startingBid, setStartingBid] = useState('')
  const [auctionEnd, setAuctionEnd] = useState('')

  /* =========================
     HELPERS
     ========================= */

  const toggleSeries = s => {
    setSeries(prev =>
      prev.includes(s)
        ? prev.filter(x => x !== s)
        : [...prev, s]
    )
  }

  const toggleTag = tag => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  /* =========================
     SUBMIT
     ========================= */

  const submit = async e => {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in')
      return
    }

    let image_url = null

    if (image) {
      const fileName = `${Date.now()}-${image.name}`

      const { error } = await supabase.storage
        .from('listings')
        .upload(fileName, image, {
          contentType: image.type,
        })

      if (error) {
        alert('Image upload failed')
        return
      }

      const { data } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName)

      image_url = data.publicUrl
    }

    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        image_url,

        // ✅ KORREKT: ARRAY ELLER NULL
        series: series.length > 0 ? series : null,
        condition: condition || null,
        tags: tags.length > 0 ? tags : null,

        allow_claim: allowClaim,
        claim_price: allowClaim ? Number(claimPrice) : null,

        allow_auction: allowAuction,
        starting_bid: allowAuction ? Number(startingBid) : null,
        auction_ends_at: allowAuction
          ? new Date(auctionEnd).toISOString()
          : null,

        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
  console.error('CREATE LISTING ERROR:', error)
  alert(error.message)
  return
}


    router.push(`/listings/${data.id}`)
  }

  /* =========================
     UI
     ========================= */

  return (
    <main className="page">
      <div className="form-card">
        <h1>Create listing</h1>

        <form onSubmit={submit}>
          {/* BASIC */}
          <div>
            <label>Card name</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
            />
          </div>

          {/* SERIES (MULTI SELECT) */}
          <div>
            <label>Series (optional – choose one or more)</label>
            <div className="chip-group">
              {SERIES.map(s => (
                <button
                  type="button"
                  key={s}
                  className={`chip ${
                    series.includes(s) ? 'active' : 'muted'
                  }`}
                  onClick={() => toggleSeries(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* CONDITION */}
          <div>
            <label>Condition</label>
            <div className="chip-group">
              {CONDITIONS.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`chip ${
                    condition === c ? 'active' : 'muted'
                  }`}
                  onClick={() => setCondition(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label>Tags</label>
            <div className="chip-group">
              {TAGS.map(t => (
                <button
                  type="button"
                  key={t}
                  className={`chip ${
                    tags.includes(t) ? 'active muted' : 'muted'
                  }`}
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SALE TYPES */}
          <div>
            <label>Sale type</label>

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={allowClaim}
                  onChange={e => setAllowClaim(e.target.checked)}
                />
                Claim price
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={allowAuction}
                  onChange={e => setAllowAuction(e.target.checked)}
                />
                Auction
              </label>
            </div>
          </div>

          {allowClaim && (
            <div>
              <label>Claim price (kr)</label>
              <input
                type="number"
                value={claimPrice}
                onChange={e => setClaimPrice(e.target.value)}
              />
            </div>
          )}

          {allowAuction && (
            <>
              <div>
                <label>Starting bid (kr)</label>
                <input
                  type="number"
                  value={startingBid}
                  onChange={e => setStartingBid(e.target.value)}
                />
              </div>

              <div>
                <label>Auction end</label>
                <input
                  type="datetime-local"
                  value={auctionEnd}
                  onChange={e => setAuctionEnd(e.target.value)}
                />
              </div>
            </>
          )}

          <button className="submit-btn">Create listing</button>
        </form>
      </div>
    </main>
  )
}

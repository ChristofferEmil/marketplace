'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import ListingsSearchUI from './ListingsSearchUI'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState(null)
  const [claimOnly, setClaimOnly] = useState(false);
  const [auctionOnly, setAuctionOnly] = useState(false);
  const [conditions, setConditions] = useState([]); // ['NM', 'EX', ...]

  



 useEffect(() => {
  setLoading(true)

  let q = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  // 🔍 SEARCH I TITLE + DESCRIPTION
  if (query && query.trim() !== '') {
    q = q.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`
    )
  }

  // 🧩 SERIES FILTER (ARRAY / text[])
  if (series) {
    q = q.contains('series', [series])
  }

    // ✅ CLAIM FILTER
  if (claimOnly) {
    q = q.eq('allow_claim', true)
  }

    // ✅ AUCTION FILTER
  if (auctionOnly) {
    q = q.eq('allow_auction', true)
  }

  // ✅ CONDITION FILTER
  if (conditions.length > 0) {
    q = q.in('condition', conditions)
  }



  q.then(({ data, error }) => {
    if (error) {
      console.error(error)
      setListings([])
    } else {
      setListings(data || [])
    }
    setLoading(false)
  })
}, [query, series, claimOnly, auctionOnly, conditions])








  return (
    <main className="page">
      {/* SEARCH + FILTER UI */}
 <ListingsSearchUI
  onSearch={setQuery}
  onSeries={setSeries}
  claimOnly={claimOnly}
  onClaimChange={setClaimOnly}
  auctionOnly={auctionOnly}
  onAuctionChange={setAuctionOnly}
  conditions={conditions}
  onConditionsChange={setConditions}
/>




      {/* LISTINGS GRID */}
      <section className="feed-grid">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="card-image skeleton" />
              <div className="card-body">
                <div className="skeleton line" />
                <div className="skeleton line short" />
              </div>
            </div>
          ))}

        {!loading &&
          listings.map(l => (
            <Link key={l.id} href={`/listings/${l.id}`}>
              <article className="card">
                <div className="card-image">
                  {l.image_url && (
                    <img src={l.image_url} alt={l.title} />
                  )}
                </div>

                <div className="card-body">
                  <h3>{l.title}</h3>
                  {l.description && (
                    <p>
                      {l.description.length > 70
                        ? `${l.description.slice(0, 70)}…`
                        : l.description}
                    </p>
                  )}
                </div>
              </article>
            </Link>
          ))}
      </section>
    </main>
  )
}

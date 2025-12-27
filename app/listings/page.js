'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import ListingsSearchUI from './ListingsSearchUI'

// 🔹 AUCTION HELPERS
const isEndingSoon = (endsAt) => {
  if (!endsAt) return false
  const now = new Date()
  const end = new Date(endsAt)
  const diffHours = (end - now) / (1000 * 60 * 60)
  return diffHours > 0 && diffHours <= 24
}

const isExpired = (endsAt) => {
  if (!endsAt) return false
  return new Date(endsAt) < new Date()
}

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [series, setSeries] = useState(null)
  const [claimOnly, setClaimOnly] = useState(false)
  const [auctionOnly, setAuctionOnly] = useState(false)
  const [conditions, setConditions] = useState([])
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)

      let q = supabase
        .from('listings')
        .select('*')

      if (query) {
        q = q.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      if (series) {
        q = q.contains('series', [series])
      }

      if (claimOnly) {
        q = q.eq('allow_claim', true)
      }

      if (auctionOnly) {
        q = q.eq('allow_auction', true)
      }

      if (conditions.length > 0) {
        q = q.in('condition', conditions)
      }

      // 🔀 SORTERING
      if (sort === 'newest') {
        q = q.order('created_at', { ascending: false })
      }

      if (sort === 'price_asc') {
        q = q
          .order('allow_claim', { ascending: false })
          .order('claim_price', { ascending: true, nullsFirst: false })
      }

      if (sort === 'price_desc') {
        q = q
          .order('allow_claim', { ascending: false })
          .order('claim_price', { ascending: false, nullsFirst: false })
      }

      const { data, error } = await q

      setListings(error ? [] : data || [])
      setLoading(false)
    }

    fetchListings()
  }, [query, series, claimOnly, auctionOnly, conditions, sort])

  return (
    <main className="page">
      <ListingsSearchUI
        onSearch={setQuery}
        onSeries={setSeries}
        series={series}
        sort={sort}
        onSortChange={setSort}
        claimOnly={claimOnly}
        onClaimChange={setClaimOnly}
        auctionOnly={auctionOnly}
        onAuctionChange={setAuctionOnly}
        conditions={conditions}
        onConditionsChange={setConditions}
        resultCount={!loading ? listings.length : null}
      />


{!loading && (
  <div className="result-count">
    {listings.length} opslag
  </div>
)}


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
  listings.map(l => {
    const expiredAuction =
      l.allow_auction && isExpired(l.auction_ends_at)

    const CardContent = (
      <article
        className={`card ${expiredAuction ? 'card-expired' : ''}`}
      >
        {/* 🔥 AUCTION BADGES */}
        {l.allow_auction && l.auction_ends_at && (
          <>
            {isExpired(l.auction_ends_at) && (
              <span className="auction-badge expired">
                Udløbet
              </span>
            )}

            {!isExpired(l.auction_ends_at) &&
              isEndingSoon(l.auction_ends_at) && (
                <span className="auction-badge ending-soon">
                  Ending soon
                </span>
              )}
          </>
        )}

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
    )

    // ❌ Udløbne auctions → ingen Link
    if (expiredAuction) {
      return <div key={l.id}>{CardContent}</div>
    }

    // ✅ Alt andet → Link
    return (
      <Link key={l.id} href={`/listings/${l.id}`}>
        {CardContent}
      </Link>
    )
  })}

      </section>
    </main>
  )
}

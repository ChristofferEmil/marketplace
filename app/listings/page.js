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

      // 🔍 SEARCH
      if (query && query.trim() !== '') {
        q = q.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      // 🧩 SERIES
      if (series) {
        q = q.contains('series', [series])
      }

      // ✅ CLAIM
      if (claimOnly) {
        q = q.eq('allow_claim', true)
      }

      // ✅ AUCTION
      if (auctionOnly) {
        q = q.eq('allow_auction', true)
      }

      // ✅ CONDITION
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

      if (error) {
        console.error(error)
        setListings([])
      } else {
        setListings(data || [])
      }

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
      />

      {(series || conditions.length || claimOnly || auctionOnly) && (
        <div className="active-filters">
          <button
            className="filter-badge clear-all"
            onClick={() => {
              setSeries(null)
              setConditions([])
              setClaimOnly(false)
              setAuctionOnly(false)
            }}
          >
            Clear all
          </button>

          {series && (
            <button
              className="filter-badge"
              onClick={() => setSeries(null)}
            >
              {series} ✕
            </button>
          )}

          {conditions.map(c => (
            <button
              key={c}
              className="filter-badge"
              onClick={() =>
                setConditions(conditions.filter(x => x !== c))
              }
            >
              {c} ✕
            </button>
          ))}

          {claimOnly && (
            <button
              className="filter-badge"
              onClick={() => setClaimOnly(false)}
            >
              Claim ✕
            </button>
          )}

          {auctionOnly && (
            <button
              className="filter-badge"
              onClick={() => setAuctionOnly(false)}
            >
              Auction ✕
            </button>
          )}
        </div>
      )}

      {!loading && listings.length === 0 && (
  <div className="empty-state">
    <h3>Ingen opslag matcher dine filtre</h3>
    <p>Prøv at fjerne nogle filtre eller ændre din søgning.</p>
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

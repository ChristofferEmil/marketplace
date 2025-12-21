'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const [listings, setListings] = useState([])
  const loading = listings.length === 0

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setListings(data || []))
  }, [])

  return (
    <main className="page page-home">

      {/* APP HERO */}
      <section className="app-hero">
        <div>
          <h1>Hello 👋</h1>
          <p>Do you have something to sell?</p>
        </div>

        <Link href="/create" className="hero-cta">
          + New listing
        </Link>
      </section>

      {/* SECTION HEADER */}
      <div className="section-header">
        <h2>Top listings</h2>
        <Link href="/listings">See more</Link>
      </div>

      {/* FEED */}
      <section className="feed-grid">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <div className="card-image skeleton" />
              <div className="card-body">
                <div className="skeleton line" />
                <div className="skeleton line short" />
              </div>
            </div>
          ))}

        {listings.map(l => (
          <Link key={l.id} href={`/listings/${l.id}`}>
            <article className="card">
              <div className="card-image">
                {l.image_url && <img src={l.image_url} alt={l.title} />}
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

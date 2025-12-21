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
   <main className="page">

      {/* HERO (mobil feed-style) */}
      <section
        style={{
          marginBottom: 24,
          padding: 20,
          borderRadius: 20,
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(37,99,235,0.08))',
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          Hello 👋
        </h1>
        <p style={{ color: '#9aa0b2', marginBottom: 14 }}>
          Do you have something to sell?
        </p>

        <Link
          href="/create"
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            borderRadius: 14,
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          + New Listing
        </Link>
      </section>

      {/* FEED */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >

          {/* Skeletons */}
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="card-image skeleton" />
                <div className="card-body">
                  <div className="skeleton" style={{ height: 18, width: '70%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: '90%' }} />
                </div>
              </div>
            ))}

          {/* Listings */}
          {listings.map(l => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card">
                <div className="card-image">
                  {l.image_url && (
                    <img src={l.image_url} alt={l.title} />
                  )}
                </div>

                <div className="card-body">
                  <h3 style={{ marginBottom: 6 }}>{l.title}</h3>
                  {l.description && (
                    <p style={{ color: '#9aa0b2', fontSize: 14 }}>
                      {l.description.length > 80
                        ? `${l.description.slice(0, 80)}…`
                        : l.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

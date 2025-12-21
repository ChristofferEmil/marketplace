'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <main className="page">
      <h1 style={{ marginBottom: 24 }}>Listings</h1>

      {/* Empty state */}
      {!loading && listings.length === 0 && (
        <p style={{ color: '#9aa0b2' }}>
          No listings yet.
        </p>
      )}

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}
      >
        {/* Skeletons */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="card-image skeleton" />
              <div className="card-body">
                <div
                  className="skeleton"
                  style={{ height: 16, width: '70%', marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, width: '90%' }}
                />
              </div>
            </div>
          ))}

        {/* Listings */}
        {!loading &&
          listings.map(l => (
            <Link
              key={l.id}
              href={`/listings/${l.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card">
                {l.image_url && (
                  <div className="card-image">
                    <img src={l.image_url} alt={l.title} />
                  </div>
                )}

                <div className="card-body">
                  <h3>{l.title}</h3>
                  {l.description && (
                    <p>
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
    </main>
  )
}

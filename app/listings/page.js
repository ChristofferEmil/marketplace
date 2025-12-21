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

      <div className="section-header">
        <h2>Listings</h2>
      </div>

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

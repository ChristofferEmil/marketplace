'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import EditProfileForm from './EditProfileForm'

export default function UserProfilePage() {
  const { username } = useParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [listings, setListings] = useState([])
  const [claimedIds, setClaimedIds] = useState([])

  const [currentUserId, setCurrentUserId] = useState(null)

  // FILTER: all | active | sold
  const [filter, setFilter] = useState('all')

  /* ---------- DELETE ---------- */
  const handleDelete = async (listingId) => {
    const ok = confirm('Vil du slette dette opslag?')
    if (!ok) return

    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (!error) {
      setListings(prev => prev.filter(l => l.id !== listingId))
    } else {
      alert('Kunne ikke slette opslag')
    }
  }

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    if (!username) return

    setLoading(true)

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null)
    })

    const fetchProfile = async () => {
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1)

      const p = profileRows?.[0] || null
      setProfile(p)

      if (p) {
        const { data: userListings } = await supabase
          .from('listings')
          .select('*')
          .eq('user_id', p.id)
          .order('created_at', { ascending: false })

        setListings(userListings || [])

        const { data: claims } = await supabase
          .from('claims')
          .select('listing_id')

        setClaimedIds((claims || []).map(c => c.listing_id))
      }

      setLoading(false)
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return <main className="page">Loader…</main>
  }

  if (!profile) {
    return (
      <main className="page">
        <h1>Profil ikke fundet</h1>
      </main>
    )
  }

  /* ---------- FILTER LOGIC ---------- */
  const filteredListings = listings.filter(l => {
    const isSold = claimedIds.includes(l.id)
    if (filter === 'active') return !isSold
    if (filter === 'sold') return isSold
    return true
  })

  const totalListings = listings.length
  const activeListings = listings.filter(
    l => !claimedIds.includes(l.id)
  ).length
  const soldListings = listings.filter(
    l => claimedIds.includes(l.id)
  ).length

  return (
    <main className="page">
      {/* AVATAR */}
      {profile.avatar_url && (
        <img
          src={`${profile.avatar_url}?t=${Date.now()}`}
          alt={profile.username}
          style={{ width: 96, height: 96, borderRadius: '50%' }}
        />
      )}

      {/* BADGES */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {totalListings >= 3 && activeListings >= 1 && (
          <span className="badge">🔥 Aktiv sælger</span>
        )}
      </div>

      <h1>{profile.username}</h1>
      {profile.city && <p>{profile.city}</p>}
      {profile.bio && <p>{profile.bio}</p>}

      <p>
        Medlem siden{' '}
        {new Date(profile.created_at).toLocaleDateString('da-DK')}
      </p>

      {/* STATS = FILTER BUTTONS */}
      <div className="profile-stats">
        <div onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
          <strong>{totalListings}</strong>
          <span>Alle</span>
        </div>
        <div onClick={() => setFilter('active')} style={{ cursor: 'pointer' }}>
          <strong>{activeListings}</strong>
          <span>Aktive</span>
        </div>
        <div onClick={() => setFilter('sold')} style={{ cursor: 'pointer' }}>
          <strong>{soldListings}</strong>
          <span>Solgte</span>
        </div>
        <div>
          <strong>{new Date(profile.created_at).getFullYear()}</strong>
          <span>Medlem</span>
        </div>
      </div>

      {currentUserId === profile.id && (
        <EditProfileForm
          profile={profile}
          onSaved={(updated) =>
            setProfile(p => ({ ...p, ...updated }))
          }
        />
      )}

      {/* LISTINGS */}
      <section className="feed-grid">
        {filteredListings.length === 0 && (
          <p>Ingen opslag at vise</p>
        )}

        {filteredListings.map(l => {
          const isSold = claimedIds.includes(l.id)

          return (
            <Link key={l.id} href={`/listings/${l.id}`}>
              <article className="card">
                {isSold && (
                  <span className="badge badge-sold">SOLGT</span>
                )}

                {currentUserId === profile.id && (
                  <div className="card-actions">
                    <button
                      className="card-action"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.location.href = `/listings/${l.id}/edit`
                      }}
                    >
                      Rediger
                    </button>

                    <button
                      className="card-action danger"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDelete(l.id)
                      }}
                    >
                      Slet
                    </button>
                  </div>
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
            </Link>
          )
        })}
      </section>
    </main>
  )
}

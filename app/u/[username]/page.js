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
    <main className="profile-page">

  {/* HERO */}
  <div className="profile-hero" />

  {/* HEADER */}
  <section className="profile-header">
    <div className="profile-left">
      <img
        className="profile-avatar"
        src={profile.avatar_url}
        alt={profile.username}
      />

      <div className="profile-meta">
        <h1 className="profile-name">{profile.name}</h1>
        <div className="profile-username">@{profile.username}</div>
        <div className="profile-member">
          Medlem siden{' '}
          {new Date(profile.created_at).toLocaleDateString('da-DK', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>

    <button className="follow-btn">
      Følg
    </button>
  </section>

  {/* BIO */}
  {profile.bio && (
    <section className="profile-bio">
      {profile.bio}
    </section>
  )}

  {/* TABS */}
  <div className="profile-tabs">
    <button
      className={`tab ${filter === 'all' ? 'active' : ''}`}
      onClick={() => setFilter('all')}
    >
      Annoncer
    </button>
    <button
      className={`tab ${filter === 'active' ? 'active' : ''}`}
      onClick={() => setFilter('active')}
    >
      Aktive
    </button>
    <button
      className={`tab ${filter === 'sold' ? 'active' : ''}`}
      onClick={() => setFilter('sold')}
    >
      Solgte
    </button>
  </div>

  {/* LISTINGS GRID */}
  <section className="profile-grid">
    {filteredListings.map(l => (
      <Link key={l.id} href={`/listings/${l.id}`}>
        <article className="card">
          {l.isClaimed && (
            <span className="badge badge-sold">SOLGT</span>
          )}

          <div className="card-image">
            {l.image_url && <img src={l.image_url} alt={l.title} />}
          </div>

          <div className="card-body">
            <h3>{l.title}</h3>
          </div>
        </article>
      </Link>
    ))}
  </section>

</main>

  )
}

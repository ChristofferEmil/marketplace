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

  // FOLLOW
  const [isFollowing, setIsFollowing] = useState(false)

  /* ---------- LOAD AUTH USER ---------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id ?? null)
    })
  }, [])

  /* ---------- LOAD PROFILE + DATA ---------- */
  useEffect(() => {
    if (!username) return

    const load = async () => {
      setLoading(true)

      // 1️⃣ hent profil
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .limit(1)

      const p = profileRows?.[0] || null
      setProfile(p)

      if (!p) {
        setLoading(false)
        return
      }

      // 2️⃣ hent opslag
      const { data: userListings } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', p.id)
        .order('created_at', { ascending: false })

      setListings(userListings || [])

      // 3️⃣ hent claims
      const { data: claims } = await supabase
        .from('claims')
        .select('listing_id')

      setClaimedIds((claims || []).map(c => c.listing_id))

      // 4️⃣ tjek follow-status
      if (currentUserId && currentUserId !== p.id) {
        const { data: followRow } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', p.id)
          .maybeSingle()

        setIsFollowing(!!followRow)
      }

      setLoading(false)
    }

    load()
  }, [username, currentUserId])

  /* ---------- FOLLOW / UNFOLLOW ---------- */
  async function handleFollow() {
    if (!currentUserId || !profile) return

    if (isFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.id)

      setIsFollowing(false)
    } else {
      await supabase.from('followers').insert({
        follower_id: currentUserId,
        following_id: profile.id,
      })

      setIsFollowing(true)
    }
  }

  if (loading) return <main className="page">Loader…</main>
  if (!profile) return <main className="page">Profil ikke fundet</main>

  /* ---------- FILTER ---------- */
  const filteredListings = listings.filter(l => {
    const isSold = claimedIds.includes(l.id)
    if (filter === 'active') return !isSold
    if (filter === 'sold') return isSold
    return true
  })

  return (
    <main className="profile-page">

      {/* HERO */}
      <div className="profile-hero" />

      {/* HEADER */}
      <section className="profile-header">
        <div className="profile-left">
          {profile.avatar_url ? (
            <img
              className="profile-avatar"
              src={profile.avatar_url}
              alt={profile.username}
            />
          ) : (
            <div className="profile-avatar placeholder">
              {profile.username[0].toUpperCase()}
            </div>
          )}

          <div className="profile-meta">
            <h1 className="profile-name">{profile.username}</h1>
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

        {currentUserId && currentUserId !== profile.id && (
          <button className="follow-btn" onClick={handleFollow}>
            {isFollowing ? 'Følger' : 'Følg'}
          </button>
        )}
      </section>

      {profile.bio && (
        <section className="profile-bio">
          {profile.bio}
        </section>
      )}

      {/* TABS */}
      <div className="profile-tabs">
        {['all', 'active', 'sold'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`tab ${filter === t ? 'active' : ''}`}
          >
            {t === 'all'
              ? 'Annoncer'
              : t === 'active'
              ? 'Aktive'
              : 'Solgte'}
          </button>
        ))}
      </div>

      {/* GRID */}
      <section className="profile-grid">
        {filteredListings.map(l => {
          const isSold = claimedIds.includes(l.id)

          return (
            <Link key={l.id} href={`/listings/${l.id}`}>
              <article className="card">
                {isSold && <span className="badge badge-sold">SOLGT</span>}

                <div className="card-image">
                  {l.image_url && <img src={l.image_url} alt={l.title} />}
                </div>

                <div className="card-body">
                  <h3>{l.title}</h3>
                </div>
              </article>
            </Link>
          )
        })}
      </section>
    </main>
  )
}

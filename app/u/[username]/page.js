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
  const [currentUserId, setCurrentUserId] = useState(null)

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

  useEffect(() => {
    if (!username) return

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

  return (
    <main className="page">
      <h1>{profile.username}</h1>

      {profile.city && <p>{profile.city}</p>}
      {profile.bio && <p>{profile.bio}</p>}

      <p>
        Medlem siden{' '}
        {new Date(profile.created_at).toLocaleDateString('da-DK')}
      </p>

      {profile && currentUserId && currentUserId === profile.id && (
        <EditProfileForm profile={profile} />
      )}

      <section className="feed-grid">
        {listings.length === 0 && <p>Ingen opslag endnu</p>}

        {listings.map(l => (
          <Link key={l.id} href={`/listings/${l.id}`}>
            <article className="card">
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

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UserProfilePage({ params }) {
  const { username } = params
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, created_at')
        .eq('username', username)
        .single()

      setProfile(error ? null : data)
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

      {profile.bio && <p>{profile.bio}</p>}

      <p>
        Medlem siden{' '}
        {new Date(profile.created_at).toLocaleDateString('da-DK')}
      </p>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfileForm({ profile }) {
  const [bio, setBio] = useState(profile.bio || '')
  const [city, setCity] = useState(profile.city || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        bio,
        city,
      })
      .eq('id', profile.id)

    if (error) {
      setError(error.message)
    }

    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} style={{ marginTop: 24 }}>
      <h3>Rediger profil</h3>

      <label>
        Bio
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
        />
      </label>

      <label>
        By
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button disabled={saving}>
        {saving ? 'Gemmer…' : 'Gem'}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfileForm({ profile }) {
  const [bio, setBio] = useState(profile.bio || '')
  const [city, setCity] = useState(profile.city || '')
  const [avatar, setAvatar] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let avatar_url = profile.avatar_url || null

    if (avatar) {
      const fileExt = avatar.name.split('.').pop()
      const filePath = `${profile.id}.${fileExt}`


      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, avatar, { upsert: true })

      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }

      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)

      avatar_url = data.publicUrl
    }

    const { error } = await supabase
      .from('profiles')
      .update({ bio, city, avatar_url })
      .eq('id', profile.id)

    if (error) setError(error.message)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} style={{ marginTop: 24 }}>
      <h3>Rediger profil</h3>

      <label>
        Avatar
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
        />
      </label>

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

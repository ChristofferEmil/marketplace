'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)


  const submit = async e => {
    e.preventDefault()
    if (!title) return

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    let imageUrl = null

    // 📤 Upload image (bucket = "listing")
    if (image) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('listings') // ✅ KORREKT BUCKET
        .upload(fileName, image)

      if (uploadError) {
        console.error(uploadError)
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from('listings') // ✅ SAMME BUCKET
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    // 📝 Create listing (table = "listings")
    const { data, error } = await supabase
      .from('listings') // ✅ KORREKT TABEL
      .insert({
        title,
        description,
        image_url: imageUrl,
        user_id: user.id,
      })
      .select()
      .single()

    setLoading(false)

    if (!error && data) {
      router.push(`/listings/${data.id}`)
    }
  }

  return (
    <main className="page">
      <h1 style={{ marginBottom: 20 }}>Create listing</h1>

      <div className="form-card">
        <form onSubmit={submit}>
          <div>
            <label>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Vintage Pokémon cards"
              required
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what you're selling…"
            />
          </div>

          <div>
            <label>Image</label>
            <input
  type="file"
  accept="image/*"
  onChange={e => {
    const file = e.target.files[0]
    setImage(file)
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }}
/>

          </div>

          {preview && (
  <img
    src={preview}
    alt="Preview"
    style={{
      marginTop: 12,
      width: '100%',
      maxHeight: 240,
      objectFit: 'cover',
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.08)',
    }}
  />
)}


          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {loading ? 'Creating…' : 'Create listing'}
          </button>
        </form>
      </div>
    </main>
  )
}

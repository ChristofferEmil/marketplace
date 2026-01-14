'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

/* =====================================================
   KONSTANTER (kan udvides senere)
===================================================== */
const TAGS = ['Holo', 'Reverse', '1st Edition', 'Shadowless', 'Promo']

/* =====================================================
   COMPONENT
===================================================== */
export default function CreateListingForm({
  mode = 'create',
  initialData = null,
  listingId = null,
  onSaved,
}) {
  const router = useRouter()




  
  async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' },
    },
    audio: false,
  })

  if (videoRef.current) {
    videoRef.current.srcObject = stream
    videoRef.current.play()
  }

  setCameraStream(stream)
}

function stopCamera() {
  if (!cameraStream) return
  cameraStream.getTracks().forEach(track => track.stop())
  setCameraStream(null)
}


  /* =====================================================
     STATE – GENERELT
  ===================================================== */
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [image, setImage] = useState(null)
  const [tags, setTags] = useState(initialData?.tags ?? [])


   /* =====================================================
     STATE - vælg om billedebibliotek eller kamera
  ===================================================== */
  const [showImageSourcePicker, setShowImageSourcePicker] = useState(false)
  const [showCameraModePicker, setShowCameraModePicker] = useState(false)



  const [showAiScan, setShowAiScan] = useState(false)
const [scanStep, setScanStep] = useState(0) // 0 = forside, 1 = bagside
const [frontImage, setFrontImage] = useState(null)
const [backImage, setBackImage] = useState(null)


const [showScanConfirm, setShowScanConfirm] = useState(false)


const videoRef = useRef(null)
const [cameraStream, setCameraStream] = useState(null)





  /* =====================================================
     STATE – KORT I OPSLAGET (VIGTIG DEL)
     👇 HER skal AI senere skrive til
  ===================================================== */
  const [items, setItems] = useState([
    { card_number: '', name: '', condition: '',price: '' },
  ])

  /* =====================================================
     KORT-HJÆLPEFUNKTIONER
     (bruges i UI og submit)
  ===================================================== */
  const addItem = () =>
    setItems(prev => [...prev, { card_number: '', name: '', price: '' }])

  const removeItem = idx =>
    setItems(prev => prev.filter((_, i) => i !== idx))

  const updateItem = (idx, key, value) =>
    setItems(prev =>
      prev.map((it, i) =>
        i === idx ? { ...it, [key]: value } : it
      )
    )

  /* =====================================================
     SUBMIT
  ===================================================== */
  const submit = async e => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    // 🔐 Auth check
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      alert('You must be logged in')
      setSaving(false)
      return
    }

    /* ---------- IMAGE UPLOAD ---------- */
    let image_url = initialData?.image_url ?? null

    if (image) {
      const fileName = `${Date.now()}-${image.name}`
      const { error } = await supabase.storage
        .from('listings')
        .upload(fileName, image)

      if (error) {
        alert('Image upload failed')
        setSaving(false)
        return
      }

      const { data } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName)

      image_url = data.publicUrl
    }

    /* ---------- LISTING ---------- */
    const payload = {
      title,
      description,
      image_url,
      tags: tags.length ? tags : null,
    }

    const query =
      mode === 'edit'
        ? supabase.from('listings').update(payload).eq('id', listingId)
        : supabase.from('listings').insert({
            ...payload,
            user_id: session.user.id,
          })

    const { data, error } = await query.select().single()

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    /* ---------- LISTING ITEMS (KORT) ---------- */
    if (items.length) {
      await supabase.from('listing_items').insert(
        items.map(it => ({
          listing_id: data.id,
          card_number: it.card_number || null,
          name: it.name,
          price: it.price ? Number(it.price) : null,
          condition: it.condition || null,
        }))
      )
    }

    onSaved ? onSaved(data) : router.push(`/listings/${data.id}`)
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="form-card">
      <h1>{mode === 'edit' ? 'Rediger opslag' : 'Opret opslag'}</h1>

      <form onSubmit={submit}>
        {/* BASISTEKST */}
        <input
          placeholder="Titel"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Beskrivelse"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />





       {/* BILLEDE */}
<input
  type="file"
  accept="image/*"
  style={{ display: 'none' }}
  id="image-input"
/>

<button
  type="button"
  onClick={() => setShowImageSourcePicker(true)}
>
  Tilføj billede
</button>





{showImageSourcePicker && (
  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
    <button
      type="button"
      onClick={() => {
        setShowImageSourcePicker(false)
        // næste trin: åbne billedebibliotek
        document.getElementById('image-input')?.click()
      }}
    >
      📁 Billedebibliotek
    </button>

    <button
      type="button"
      onClick={() => {
        setShowImageSourcePicker(false)
        setShowCameraModePicker(true)
      }}
    >
      📷 Kamera
    </button>
  </div>
)}





{showCameraModePicker && (
  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
    <button
      type="button"
      onClick={() => {
        setShowCameraModePicker(false)
        alert('Almindeligt kamera (kommer senere)')
      }}
    >
      📷 Kamera
    </button>

    <button
  type="button"
  onClick={() => {
    setShowCameraModePicker(false)
    setShowAiScan(true)
    startCamera()
  }}
>
  ✨ AI scan
</button>

  </div>
)}




{showAiScan && (
  <div
    style={{
      marginTop: 24,
      padding: 16,
      border: '1px solid #ddd',
      borderRadius: 8,
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 12,
        fontWeight: 600,
      }}
    >
      <span>{scanStep === 0 ? 'Forside' : 'Bagside'}</span>
      <span>{scanStep + 1}/2</span>
    </div>

    {/* CAMERA PLACEHOLDER */}
    <div
  style={{
    position: 'relative',
    width: '100%',
    aspectRatio: '3 / 4',
    background: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  }}
>
  <video
    ref={videoRef}
    playsInline
    muted
    autoPlay
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />

  {/* RAMME */}
  <div
    style={{
      position: 'absolute',
      inset: '10%',
      border: '2px solid rgba(255,255,255,0.85)',
      borderRadius: 8,
      pointerEvents: 'none',
    }}
  />

  {/* GUIDE */}
  <div
    style={{
      position: 'absolute',
      bottom: 8,
      width: '100%',
      textAlign: 'center',
      color: '#fff',
      fontSize: 14,
      opacity: 0.9,
    }}
  >
    Læg kortet inden for rammen
  </div>
</div>


    {/* ACTIONS */}
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={() => {
          if (scanStep === 0) {
            setFrontImage(true) // placeholder
            setScanStep(1)
          } else {
            setBackImage(true) // placeholder
          }
        }}
      >
        Tag billede
      </button>

      {scanStep === 1 && frontImage && backImage && (
        <button
  type="button"
  onClick={() => {
    setShowAiScan(false)
    setShowScanConfirm(true)
  }}
>
  Videre
</button>

      )}
    </div>
  </div>
)}






{showScanConfirm && (
  <div
    style={{
      marginTop: 24,
      padding: 16,
      border: '1px solid #ddd',
      borderRadius: 8,
    }}
  >
    <h3>Bekræft kort</h3>

    {/* BILLEDER (PLACEHOLDERS) */}
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <div
        style={{
          width: 80,
          aspectRatio: '3 / 4',
          background: '#eee',
          borderRadius: 6,
        }}
      />
      <div
        style={{
          width: 80,
          aspectRatio: '3 / 4',
          background: '#eee',
          borderRadius: 6,
        }}
      />
    </div>

    {/* AUTO-UDFYLDTE FELTER (PLACEHOLDER) */}
    <input
      type="text"
      placeholder="Kortnavn"
      defaultValue="Pikachu"
      style={{ width: '100%', marginBottom: 8 }}
    />

    <input
      type="text"
      placeholder="Kortnummer"
      defaultValue="25/102"
      style={{ width: '100%', marginBottom: 8 }}
    />

    {/* MANUELLE FELTER */}
    <select style={{ width: '100%', marginBottom: 8 }}>
      <option value="">Stand</option>
      <option value="NM">NM – Near Mint</option>
      <option value="EX">EX – Excellent</option>
      <option value="LP">LP – Light Played</option>
      <option value="PL">PL – Played</option>
      <option value="PO">PO – Poor</option>
    </select>

    <input
      type="number"
      placeholder="Pris"
      style={{ width: '100%', marginBottom: 12 }}
    />

    {/* ACTIONS */}
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={() => {
          setShowScanConfirm(false)
          setShowAiScan(true)
        }}
      >
        Næste kort
      </button>

      <button
        type="button"
        onClick={() => {
          setShowScanConfirm(false)
          alert('Kort klar til at blive tilføjet (næste trin)')
        }}
      >
        Tilføj kort
      </button>
    </div>
  </div>
)}














        {/* TAGS */}
        <div className="chip-group">
          {TAGS.map(t => (
            <button
              key={t}
              type="button"
              className={`chip ${tags.includes(t) ? 'active' : ''}`}
              onClick={() =>
                setTags(prev =>
                  prev.includes(t)
                    ? prev.filter(x => x !== t)
                    : [...prev, t]
                )
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* =============================
            KORT-LISTE (CENTRAL DEL)
           ============================= */}
        <h3>Kort i opslaget</h3>

        {items.map((it, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 100px auto',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <input
              placeholder="#"
              value={it.card_number}
              onChange={e =>
                updateItem(idx, 'card_number', e.target.value)
              }
            />

            <input
              placeholder="Kortnavn"
              value={it.name}
              onChange={e =>
                updateItem(idx, 'name', e.target.value)
              }
              required
            />

           <select
  value={it.condition || ''}
  onChange={e =>
    updateItem(idx, 'condition', e.target.value)
  }
>
  <option value="">Stand</option>
  <option value="NM">NM – Near Mint</option>
  <option value="EX">EX – Excellent</option>
  <option value="GD">GD – Good</option>
  <option value="LP">LP – Light Played</option>
  <option value="PL">PL – Played</option>
  <option value="PO">PO – Poor</option>
</select>




            <input
              placeholder="Pris"
              type="number"
              value={it.price}
              onChange={e =>
                updateItem(idx, 'price', e.target.value)
              }
            />

            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)}>
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem}>
          + Tilføj kort
        </button>

        <button className="submit-btn" disabled={saving}>
          {saving ? 'Gemmer…' : 'Opret opslag'}
        </button>
      </form>
    </div>
  )
}

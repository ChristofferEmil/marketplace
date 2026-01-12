'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

// ⬇️ JUSTÉR DENNE IMPORT TIL DIN EKSISTERENDE CREATE-FORM
// Fx: import CreateListingForm from '../../create/CreateListingForm'
import CreateListingForm from '../../create/CreateListingForm'


export default function EditListingPage() {
  const { id } = useParams()
  const router = useRouter()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)


  // =======================
// MESSAGE + SELECTED ITEMS STATE
// =======================
const [message, setMessage] = useState("")
const [selectedItems, setSelectedItems] = useState([])


// =======================
// TOGGLE CARD SELECTION
// =======================
function toggleItem(item) {
  setSelectedItems(prev => {
    const exists = prev.find(i => i.id === item.id)

    if (exists) {
      // fjern kort
      return prev.filter(i => i.id !== item.id)
    }

    // tilføj kort
    return [...prev, item]
  })
}




  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      // Hent logget bruger
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth?.user?.id ?? null
      setCurrentUserId(userId)

      // Hent listing
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/listings')
        return
      }

      // Ejerskabs-check
      if (data.user_id !== userId) {
        router.push('/listings')
        return
      }

      setListing(data)
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  if (loading) {
    return <main className="page">Loader…</main>
  }

  if (!listing) {
    return (
      <main className="page">
        <h1>Opslag ikke fundet</h1>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>Rediger opslag</h1>

      <CreateListingForm
        mode="edit"
        initialData={listing}
        listingId={listing.id}
        onSaved={() => router.push(`/listings/${listing.id}`)}
      />
    </main>
  )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({
        storeSession: true,
      })

      if (error) {
        console.error(error)
        router.replace('/login')
        return
      }

      // PASSWORD RESET FLOW
      if (data?.session) {
        router.replace('/reset-password')
      } else {
        router.replace('/login')
      }
    }

    handleAuth()
  }, [router])

  return (
    <main className="page">
      <p>Logger ind…</p>
    </main>
  )
}

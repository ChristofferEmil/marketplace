'use client'


import { useEffect } from 'react'
import { useRouter } from 'next/navigation'


export default function AuthRecoveryRedirect() {
  const router = useRouter()


  useEffect(() => {
    if (typeof window === 'undefined') return


    const hash = window.location.hash


    if (hash.includes('type=recovery')) {
      // Bevar token i hash
      router.replace(`/reset-password${hash}`)
    }
  }, [router])


  return null
}
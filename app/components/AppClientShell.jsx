'use client'

import { useState } from 'react'
import Nav from './Nav'
import AuthModal from './AuthModal'
import AuthTopBar from './AuthTopBar'

export default function AppClientShell({ children }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  return (
    <>
      <AuthTopBar
        openAuth={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
      />

      <Nav />

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      {children}
    </>
  )
}

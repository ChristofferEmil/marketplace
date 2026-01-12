'use client'

import { useState } from 'react'
import Nav from './Nav'
import AuthModal from './AuthModal'


export default function AppClientShell({ children }) {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  return (
    <>
     

      <Nav
        openAuth={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
      />

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      {children}
    </>
  )
}

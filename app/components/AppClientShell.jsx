'use client'

import Nav from './Nav'

export default function AppClientShell({ children }) {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}

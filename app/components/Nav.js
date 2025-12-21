'use client'

import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          CardSwap
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/listings">Listings</Link>
          <Link href="/inbox">Inbox</Link>
          <Link href="/create" className="nav-cta">
            + Create
          </Link>
        </div>
      </div>
    </nav>
  )
}

'use client'

import { useState, useEffect } from 'react'

export default function ListingsSearchUI({
  onSearch,
  onSeries,
  claimOnly,
  onClaimChange,
  auctionOnly,
  onAuctionChange,
  conditions,
  onConditionsChange,
}) {
  /* =========================
     STATE – SEARCH & FILTER UI
     ========================= */
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)

  /* =========================
     LOCK BODY SCROLL WHEN OPEN
     ========================= */
  useEffect(() => {
    if (filtersOpen) {
      document.body.classList.add('filter-open')
    } else {
      document.body.classList.remove('filter-open')
    }

    return () => {
      document.body.classList.remove('filter-open')
    }
  }, [filtersOpen])

  // Chips = SERIER
  const chips = ['All', 'Base Set', 'Jungle', 'Fossil', 'Neo', 'Modern']

  return (
    <>
      {/* =========================
          SEARCH BAR
         ========================= */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>

        <input
          placeholder="Search Pokémon cards…"
          value={search}
          onChange={(e) => {
            const v = e.target.value
            setSearch(v)
            onSearch(v)
          }}
        />

        <button className="filter-btn" onClick={() => setFiltersOpen(true)}>
          ☰
        </button>
      </div>

      {/* =========================
          QUICK SERIES CHIPS
         ========================= */}
      <div className="chip-row">
        {chips.map((chip) => (
          <button
            key={chip}
            className={`chip ${activeChip === chip ? 'active' : ''}`}
            onClick={() => {
              setActiveChip(chip)
              onSeries(chip === 'All' ? null : chip)
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* =========================
          OVERLAY
         ========================= */}
      {filtersOpen && (
        <div
          className="filter-overlay"
          onClick={() => setFiltersOpen(false)}
        />
      )}

      {/* =========================
          FILTER PANEL
         ========================= */}
      <aside className={`filter-panel ${filtersOpen ? 'open' : ''}`}>
        {/* ---------- HEADER ---------- */}
        <div className="filter-header">
          <span className="filter-title">Filtre</span>

          <button
            className="filter-reset"
            onClick={() => {
              onSearch('')
              onSeries(null)
              onClaimChange(false)
              onAuctionChange(false)
              onConditionsChange([])
            }}
          >
            Nulstil
          </button>

          <button
            className="filter-close"
            onClick={() => setFiltersOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* ---------- SCROLL CONTENT ---------- */}
        <div className="filter-panel-content">
          <section className="filter-section">
            <h4>Price range</h4>
            <div className="price-placeholder">
              <span>Min</span>
              <span>—</span>
              <span>Max</span>
            </div>
          </section>

          <section className="filter-section">
            <h4>Series</h4>
            {['Base Set', 'Jungle', 'Fossil', 'Neo', 'Modern'].map((s) => (
              <label key={s} className="checkbox">
                <input type="checkbox" disabled />
                {s}
              </label>
            ))}
          </section>

          <section className="filter-section">
            <h4>Condition</h4>
            {['NM', 'EX', 'VG', 'LP'].map((c) => (
              <label key={c} className="checkbox">
                <input
                  type="checkbox"
                  checked={conditions.includes(c)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onConditionsChange([...conditions, c])
                    } else {
                      onConditionsChange(
                        conditions.filter((x) => x !== c)
                      )
                    }
                  }}
                />
                {c}
              </label>
            ))}
          </section>

          <section className="filter-section">
            <h4>Status</h4>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={claimOnly}
                onChange={(e) => onClaimChange(e.target.checked)}
              />
              Claim
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={auctionOnly}
                onChange={(e) => onAuctionChange(e.target.checked)}
              />
              Auction
            </label>
          </section>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="filter-footer">
          <button
            className="apply-btn"
            onClick={() => setFiltersOpen(false)}
          >
            Vis resultater
          </button>

          <button
            className="reset-btn"
            onClick={() => {
              onSearch('')
              onSeries(null)
              onClaimChange(false)
              onAuctionChange(false)
              onConditionsChange([])
              setFiltersOpen(false)
            }}
          >
            Nulstil filtre
          </button>
        </div>
      </aside>
    </>
  )
}

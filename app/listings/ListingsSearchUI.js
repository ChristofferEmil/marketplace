'use client'

import { useState } from 'react'

export default function ListingsSearchUI({
  onSearch,
  onSeries,
  claimOnly,
  onClaimChange,
}) {

  /* =========================
     STATE – SEARCH & FILTER UI
     ========================= */
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Chips = SERIER (for nu)
  const chips = [
    'All',
    'Base Set',
    'Jungle',
    'Fossil',
    'Neo',
    'Modern',
  ]

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
            onSearch(v) // 🔔 tekstsøgning
          }}
        />

        <button
          className="filter-btn"
          onClick={() => setFiltersOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* =========================
          CHIPS (SERIES FILTER)
         ========================= */}
      <div className="chip-row">
        {chips.map(chip => (
          <button
            key={chip}
            className={`chip ${activeChip === chip ? 'active' : ''}`}
            onClick={() => {
                console.log('SERIES CLICKED:', chip)
              setActiveChip(chip)

              // 🔔 send serie op
              if (chip === 'All') {
                onSeries(null)
              } else {
                onSeries(chip)
              }
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
          FILTER PANEL (UI ONLY – IKKE AKTIV ENDNU)
         ========================= */}
      <aside className={`filter-panel ${filtersOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <strong>Filters</strong>
          <button onClick={() => setFiltersOpen(false)}>✕</button>
        </div>

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
          {['Base Set', 'Jungle', 'Fossil', 'Neo', 'Modern'].map(s => (
            <label key={s} className="checkbox">
              <input type="checkbox" disabled />
              {s}
            </label>
          ))}
        </section>

        <section className="filter-section">
          <h4>Condition</h4>
          {['NM', 'EX', 'VG', 'LP'].map(c => (
            <label key={c} className="checkbox">
              <input type="checkbox" disabled />
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
</section>


        <div className="filter-footer">
          <button className="apply-btn" disabled>
            Apply filters
          </button>
        </div>
      </aside>
    </>
  )
}

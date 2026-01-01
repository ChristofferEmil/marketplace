'use client'

export default function AuthModal({ open, onClose, mode }) {
  if (!open) return null

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>×</button>

        <h2>{mode === 'login' ? 'Log ind' : 'Opret konto'}</h2>

        {/* Auth form kommer i TRIN 3 */}
        <div style={{ opacity: 0.6 }}>
          (Auth form kommer her)
        </div>
      </div>
    </div>
  )
}

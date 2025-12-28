'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestProfilePage() {
  const [rows, setRows] = useState(null)

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      console.log('profiles test', data, error)
      setRows(data || [])
    }

    test()
  }, [])

  return (
    <main className="page">
      <h1>Profiles test</h1>

      {rows === null && <p>Loader…</p>}

      {rows && rows.length === 0 && <p>Ingen rows</p>}

      {rows && rows.length > 0 && (
        <pre>{JSON.stringify(rows, null, 2)}</pre>
      )}
    </main>
  )
}

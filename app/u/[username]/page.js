import { supabase } from '@/lib/supabaseClient'

export default async function UserProfilePage({ params }) {
  const { username } = params

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, bio, avatar_url, created_at')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return (
      <main className="page">
        <h1>Profil ikke fundet</h1>
      </main>
    )
  }

  return (
    <main className="page">
      <h1>{profile.username}</h1>

      {profile.bio && <p>{profile.bio}</p>}

      <p>
        Medlem siden{' '}
        {new Date(profile.created_at).toLocaleDateString('da-DK')}
      </p>
    </main>
  )
}

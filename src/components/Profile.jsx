import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const Profile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div>
      {user ? <p>Welcome, {user.email}</p> : <p>Please sign in.</p>}
    </div>
  )
}

export default Profile

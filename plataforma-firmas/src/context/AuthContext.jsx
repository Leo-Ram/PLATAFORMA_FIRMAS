import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null) // fila de public.usuarios (nombre, rol)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Revisa si ya hay una sesión activa (al recargar la página)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) cargarPerfil(session.user.id)
      else setCargando(false)
    })

    // Escucha cambios de sesión (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        cargarPerfil(session.user.id)
      } else {
        setPerfil(null)
        setCargando(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', userId)
      .single()

    if (error) {
      console.error('Error cargando perfil:', error)
    } else {
      setPerfil(data)
    }
    setCargando(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, perfil, cargando, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
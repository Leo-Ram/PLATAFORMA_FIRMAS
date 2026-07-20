import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function VotosProyecto({ proyecto }) {
  const { session, perfil } = useAuth()
  const [votos, setVotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [votando, setVotando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarVotos()
  }, [proyecto.id_proyecto])

  async function cargarVotos() {
    setCargando(true)
    const { data, error } = await supabase
      .from('votos_firmas')
      .select('*, usuarios(nombre_completo)')
      .eq('id_proyecto', proyecto.id_proyecto)

    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      setVotos(data)
    }
    setCargando(false)
  }

  async function votar(decision) {
    setError('')
    setVotando(true)

    const { error } = await supabase.from('votos_firmas').insert({
      id_proyecto: proyecto.id_proyecto,
      id_usuario: session.user.id,
      decision,
      // token_hash queda null por ahora; lo llenará la Edge Function en el siguiente paso
    })

    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      await cargarVotos()
    }
    setVotando(false)
  }

  if (cargando) return <p>Cargando votos...</p>

  const miVoto = votos.find((v) => v.id_usuario === session.user.id)
  const puedeVotar = perfil?.rol === 'aprobador' && proyecto.estado === 'en_votacion' && !miVoto

  const totalSi = votos.filter((v) => v.decision === 'SI').length
  const totalNo = votos.filter((v) => v.decision === 'NO').length

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>
      <h3>Votación</h3>
      <p>
        A favor (SI): {totalSi} — En contra (NO): {totalNo} — Total votos: {votos.length}
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {miVoto && (
        <p>
          Ya votaste: <strong>{miVoto.decision}</strong> el{' '}
          {new Date(miVoto.fecha_voto).toLocaleString()}
        </p>
      )}

      {puedeVotar && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => votar('SI')} disabled={votando}>
            {votando ? 'Enviando...' : 'Votar SI'}
          </button>
          <button onClick={() => votar('NO')} disabled={votando}>
            {votando ? 'Enviando...' : 'Votar NO'}
          </button>
        </div>
      )}

      {proyecto.estado !== 'en_votacion' && !miVoto && (
        <p><em>Este proyecto no está en votación.</em></p>
      )}

      <details style={{ marginTop: '1rem' }}>
        <summary>Ver detalle de votos</summary>
        <ul>
          {votos.map((v) => (
            <li key={v.id_voto}>
              {v.usuarios?.nombre_completo || v.id_usuario}: {v.decision} —{' '}
              {new Date(v.fecha_voto).toLocaleString()}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
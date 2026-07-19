import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const ESTADO_COLORES = {
  borrador: '#999',
  en_votacion: '#0077cc',
  aprobado: '#2e7d32',
  rechazado: '#c62828',
  anulado: '#555',
}

export default function ListaProyectos({ onSeleccionar, onNuevo, esAdmin }) {
  const [proyectos, setProyectos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarProyectos()
  }, [])

  async function cargarProyectos() {
    setCargando(true)
    const { data, error } = await supabase
      .from('proyectos')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      setProyectos(data)
    }
    setCargando(false)
  }

  if (cargando) return <p>Cargando proyectos...</p>
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Proyectos</h2>
        {esAdmin && <button onClick={onNuevo}>+ Nuevo proyecto</button>}
      </div>

      {proyectos.length === 0 && <p>No hay proyectos para mostrar.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {proyectos.map((p) => (
          <li
            key={p.id_proyecto}
            onClick={() => onSeleccionar(p)}
            style={{
              border: '1px solid #ddd',
              borderRadius: 8,
              padding: '1rem',
              marginBottom: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{p.titulo}</strong>
              <span
                style={{
                  color: '#fff',
                  background: ESTADO_COLORES[p.estado] || '#777',
                  padding: '0.15rem 0.6rem',
                  borderRadius: 12,
                  fontSize: '0.8rem',
                }}
              >
                {p.estado}
              </span>
            </div>
            <small>{new Date(p.fecha_creacion).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
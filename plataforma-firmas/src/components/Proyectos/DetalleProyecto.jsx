import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import FormularioProyecto from './FormularioProyecto'
import VotosProyecto from './VotosProyecto'

export default function DetalleProyecto({ proyecto, esAdmin, onVolver, onActualizado }) {
  const [cambiando, setCambiando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState('')

  async function cambiarEstado(nuevoEstado) {
    setError('')
    setCambiando(true)

    const { data, error } = await supabase
      .from('proyectos')
      .update({ estado: nuevoEstado })
      .eq('id_proyecto', proyecto.id_proyecto)
      .select()
      .single()

    if (error) {
      setError(error.message)
      console.error(error)
    } else {
      onActualizado(data)
    }
    setCambiando(false)
  }

  if (editando) {
    return (
      <FormularioProyecto
        proyectoExistente={proyecto}
        onGuardado={(actualizado) => {
          onActualizado(actualizado)
          setEditando(false)
        }}
        onCancelar={() => setEditando(false)}
      />
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <button onClick={onVolver}>← Volver</button>
      <h2>{proyecto.titulo}</h2>
      <p><em>Estado: {proyecto.estado}</em></p>

      <div dangerouslySetInnerHTML={{ __html: proyecto.contenido_html }} />

      {proyecto.estado !== 'borrador' && <VotosProyecto proyecto={proyecto} />}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {esAdmin && proyecto.estado === 'borrador' && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: 8 }}>
          <p>Este proyecto sigue en borrador. Al pasarlo a votación, el contenido quedará bloqueado permanentemente.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setEditando(true)}>Editar</button>
            <button onClick={() => cambiarEstado('en_votacion')} disabled={cambiando}>
              {cambiando ? 'Actualizando...' : 'Pasar a votación'}
            </button>
          </div>
        </div>
      )}
      {esAdmin && proyecto.estado === 'en_votacion' && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3f3', borderRadius: 8 }}>
          <p>Este proyecto está en votación. Si necesitas detenerlo por algún motivo, puedes anularlo.</p>
          <button
            onClick={() => cambiarEstado('anulado')}
            disabled={cambiando}
            style={{ background: '#c62828', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: 4 }}
          >
            {cambiando ? 'Anulando...' : 'Anular proyecto'}
          </button>
        </div>
      )}
    </div>
  )
}
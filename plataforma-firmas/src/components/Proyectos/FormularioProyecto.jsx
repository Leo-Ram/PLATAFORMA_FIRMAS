import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function FormularioProyecto({ proyectoExistente, onGuardado, onCancelar }) {
  const { session } = useAuth()
  const [titulo, setTitulo] = useState(proyectoExistente?.titulo || '')
  const [contenido, setContenido] = useState(proyectoExistente?.contenido_html || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const esEdicion = Boolean(proyectoExistente)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    let resultado

    if (esEdicion) {
      resultado = await supabase
        .from('proyectos')
        .update({ titulo, contenido_html: contenido })
        .eq('id_proyecto', proyectoExistente.id_proyecto)
        .select()
        .single()
    } else {
      resultado = await supabase
        .from('proyectos')
        .insert({
          titulo,
          contenido_html: contenido,
          creado_by: session.user.id,
        })
        .select()
        .single()
    }

    const { data, error } = resultado

    if (error) {
      setError(error.message)
      console.error(error)
      setGuardando(false)
    } else {
      onGuardado(data)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>{esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Contenido</label>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            required
            rows={10}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar como borrador'}
          </button>
          <button type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
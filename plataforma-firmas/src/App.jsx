import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import ListaProyectos from './components/Proyectos/ListaProyectos'
import FormularioProyecto from './components/Proyectos/FormularioProyecto'
import DetalleProyecto from './components/Proyectos/DetalleProyecto'

function App() {
  const { session, perfil, cargando, logout } = useAuth()
  const [vista, setVista] = useState('lista') // 'lista' | 'nuevo' | 'detalle'
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)

  if (cargando) return <p style={{ padding: '2rem' }}>Cargando...</p>
  if (!session) return <Login />

  const esAdmin = perfil?.rol === 'admin'

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ddd',
          fontFamily: 'sans-serif',
        }}
      >
        <span>
          {perfil?.nombre_completo} ({perfil?.rol})
        </span>
        <button onClick={logout}>Cerrar sesión</button>
      </header>

      {vista === 'lista' && (
        <ListaProyectos
          esAdmin={esAdmin}
          onNuevo={() => setVista('nuevo')}
          onSeleccionar={(p) => {
            setProyectoSeleccionado(p)
            setVista('detalle')
          }}
        />
      )}

      {vista === 'nuevo' && (
        <FormularioProyecto
          onGuardado={() => setVista('lista')}
          onCancelar={() => setVista('lista')}
        />
      )}

      {vista === 'detalle' && proyectoSeleccionado && (
        <DetalleProyecto
          proyecto={proyectoSeleccionado}
          esAdmin={esAdmin}
          onVolver={() => setVista('lista')}
          onActualizado={(actualizado) => setProyectoSeleccionado(actualizado)}
        />
      )}
    </div>
  )
}

export default App
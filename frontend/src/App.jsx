import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import SociosPage from './pages/SociosPage';
import SocioDetailPage from './pages/SocioDetailPage';
import MembresiasPage from './pages/MembresiasPage';
import TiendaPage from './pages/TiendaPage';
import VentasPage from './pages/VentasPage';
import ReservasPage from './pages/ReservasPage';
import VisitantesPage from './pages/VisitantesPage';
import UsuariosPage from './pages/UsuariosPage';
import CambioPasswordPage from './pages/CambioPasswordPage';
import ReportesPage from './pages/ReportesPage';
import MetodoPage from './pages/MetodoPage';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to="/socios" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, mustChangePassword } = useAuth();

  const redirectHome = () => {
    if (!user) return '/login';
    const map = {
      administrador: '/socios',
      recepcionista: '/socios',
      entrenador: '/reservas',
      cliente: '/socios/1'
    };

    return map[user.rol] || '/socios';
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cambiar-password" element={<ProtectedRoute><CambioPasswordPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={redirectHome()} replace />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/socios" element={<SociosPage />} />
        <Route path="/socios/:id" element={<SocioDetailPage />} />
        <Route path="/usuarios" element={<ProtectedRoute roles={['administrador']}><UsuariosPage /></ProtectedRoute>} />
        <Route path="/membresias" element={<ProtectedRoute roles={['administrador', 'recepcionista', 'cliente']}><MembresiasPage /></ProtectedRoute>} />
        <Route path="/tienda" element={<ProtectedRoute roles={['administrador', 'recepcionista', 'cliente']}><TiendaPage /></ProtectedRoute>} />
        <Route path="/ventas" element={<ProtectedRoute roles={['administrador', 'recepcionista']}><VentasPage /></ProtectedRoute>} />
        <Route path="/reservas" element={<ProtectedRoute roles={['administrador', 'recepcionista', 'entrenador', 'cliente']}><ReservasPage /></ProtectedRoute>} />
        <Route path="/visitantes" element={<ProtectedRoute roles={['administrador', 'recepcionista']}><VisitantesPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute roles={['administrador']}><ReportesPage /></ProtectedRoute>} />
        <Route path="/metodo" element={<ProtectedRoute roles={['administrador', 'recepcionista', 'entrenador', 'cliente']}><MetodoPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={mustChangePassword ? '/cambiar-password' : redirectHome()} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldPlus } from 'lucide-react';
import logoTempel from '../assets/LogoTempelTraining.png';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, mustChangePassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAdmin, setHasAdmin] = useState(false);
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [bootstrapName, setBootstrapName] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [bootstrapSuccess, setBootstrapSuccess] = useState('');

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await api.get('/auth/bootstrap-status');
        setHasAdmin(Boolean(response.data.hasAdmin));
      } catch {
        setHasAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (user) {
    navigate(mustChangePassword ? '/cambiar-password' : '/socios');
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
      navigate(response.mustChangePassword ? '/cambiar-password' : '/socios');
    } catch (err) {
      setError(err?.response?.data?.message || 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapAdmin = async (event) => {
    event.preventDefault();
    setBootstrapLoading(true);
    setBootstrapError('');
    setBootstrapSuccess('');

    try {
      await api.post('/auth/bootstrap-admin', {
        nombre: bootstrapName,
        email: bootstrapEmail,
        password: bootstrapPassword
      });

      setHasAdmin(true);
      setShowBootstrap(false);
      setBootstrapSuccess('Administrador creado. Bienvenido.');
      const response = await login({ email: bootstrapEmail, password: bootstrapPassword });
      navigate(response.mustChangePassword ? '/cambiar-password' : '/socios');
    } catch (err) {
      setBootstrapError(err?.response?.data?.message || 'No se pudo crear el administrador.');
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tempel-bg px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-tempel-border bg-tempel-card shadow-[0_0_40px_rgba(41,182,246,0.12)] lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-tempel-blue/10 via-tempel-card to-tempel-bg p-8 lg:p-12">
          <img
            src={logoTempel}
            alt="Tempel Training"
            className="mb-6 h-44 w-auto object-contain drop-shadow-[0_0_30px_rgba(41,182,246,0.35)]"
          />
          <h1 className="text-4xl font-semibold tracking-tight text-tempel-text">Tempel Training</h1>
          <p className="mt-4 max-w-sm text-center text-base text-tempel-muted">
            Plataforma de gestión para socios, reservas, ventas y control operativo del gimnasio.
          </p>
          <div className="mt-10 grid w-full max-w-xs gap-3 text-sm text-tempel-muted">
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/60 p-3">Usa tus credenciales reales del sistema.</div>
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/60 p-3">Los clientes creados por el sistema reciben contraseña temporal.</div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-tempel-blue">Bienvenido</p>
              <h2 className="mt-3 text-3xl font-semibold text-tempel-text">Iniciar sesión</h2>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-tempel-muted">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-4 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                placeholder="correo@tempel.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-tempel-muted">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-4 py-3 pr-11 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-3.5 text-tempel-muted hover:text-tempel-text"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm text-estado-rojo">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-tempel-blue px-4 py-3 font-medium text-white shadow-[0_0_20px_rgba(41,182,246,0.35)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            {!hasAdmin ? (
              <button
                type="button"
                onClick={() => setShowBootstrap((value) => !value)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-tempel-border bg-tempel-bg px-4 py-2.5 text-sm text-tempel-text hover:border-tempel-blue"
              >
                <ShieldPlus className="h-4 w-4" />
                {showBootstrap ? 'Cerrar creación de administrador' : 'Crear primer administrador'}
              </button>
            ) : null}

            {showBootstrap && !hasAdmin ? (
              <form onSubmit={handleBootstrapAdmin} className="space-y-3 rounded-2xl border border-tempel-border bg-tempel-bg/60 p-4">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-tempel-muted">Nombre</label>
                  <input
                    value={bootstrapName}
                    onChange={(event) => setBootstrapName(event.target.value)}
                    className="w-full rounded-xl border border-tempel-border bg-tempel-card px-3 py-2.5 text-tempel-text focus:border-tempel-blue focus:outline-none"
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-tempel-muted">Email</label>
                  <input
                    type="email"
                    value={bootstrapEmail}
                    onChange={(event) => setBootstrapEmail(event.target.value)}
                    className="w-full rounded-xl border border-tempel-border bg-tempel-card px-3 py-2.5 text-tempel-text focus:border-tempel-blue focus:outline-none"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-tempel-muted">Contraseña</label>
                  <input
                    type="password"
                    value={bootstrapPassword}
                    onChange={(event) => setBootstrapPassword(event.target.value)}
                    className="w-full rounded-xl border border-tempel-border bg-tempel-card px-3 py-2.5 text-tempel-text focus:border-tempel-blue focus:outline-none"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {bootstrapError ? <p className="text-sm text-estado-rojo">{bootstrapError}</p> : null}
                {bootstrapSuccess ? <p className="text-sm text-estado-verde">{bootstrapSuccess}</p> : null}

                <button
                  type="submit"
                  disabled={bootstrapLoading}
                  className="w-full rounded-xl bg-estado-verde px-4 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
                >
                  {bootstrapLoading ? 'Creando administrador...' : 'Guardar administrador principal'}
                </button>
              </form>
            ) : null}

            <button type="button" className="w-full text-center text-sm text-tempel-muted hover:text-tempel-text">
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CambioPasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      navigate('/socios');
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-tempel-bg px-4">
      <div className="w-full max-w-lg rounded-3xl border border-tempel-border bg-tempel-card p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Seguridad</p>
        <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Cambio de contraseña</h1>
        <p className="mt-2 text-sm text-tempel-muted">Hola {user?.nombre || 'usuario'}, por seguridad debes actualizar tu contraseña antes de continuar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-tempel-muted">Contraseña actual</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
              className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-tempel-muted">Nueva contraseña</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
              className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-tempel-muted">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none"
            />
          </div>

          {error ? <p className="text-sm text-estado-rojo">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-tempel-blue px-4 py-3 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)] disabled:opacity-60"
          >
            {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

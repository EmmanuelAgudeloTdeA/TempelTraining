import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const initialForm = {
  nombre: '',
  email: '',
  password: '',
  rol: 'recepcionista',
  especialidad: ''
};

const roleLabels = {
  administrador: 'Administrador',
  recepcionista: 'Recepcionista',
  entrenador: 'Entrenador'
};

const roleColors = {
  administrador: 'blue',
  recepcionista: 'yellow',
  entrenador: 'green'
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      setUsuarios([]);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      nextErrors.email = 'El email es obligatorio.';
    } else if (!emailRegex.test(form.email)) {
      nextErrors.email = 'El email no tiene un formato válido.';
    }

    if (!editingId && (!form.password || form.password.length < 6)) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (editingId && form.password && form.password.length < 6) {
      nextErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (form.rol === 'entrenador' && !form.especialidad.trim()) {
      nextErrors.especialidad = 'La especialidad es obligatoria para entrenadores.';
    }

    return nextErrors;
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setIsOpen(true);
  };

  const openEditModal = (usuario) => {
    setEditingId(usuario.id);
    setForm({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      especialidad: usuario.especialidad || ''
    });
    setErrors({});
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payload = {
        ...form,
        especialidad: form.rol === 'entrenador' ? form.especialidad : undefined
      };

      if (editingId) {
        await api.put(`/usuarios/${editingId}`, payload);
        setFeedback({ type: 'success', message: 'Usuario actualizado correctamente.' });
      } else {
        await api.post('/usuarios', payload);
        setFeedback({ type: 'success', message: 'Usuario creado correctamente.' });
      }

      setIsOpen(false);
      setForm(initialForm);
      setErrors({});
      setEditingId(null);
      await loadUsuarios();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo guardar el usuario.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Administración</p>
          <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Usuarios</h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]"
        >
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      {feedback.message ? (
        <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-estado-verde/30 bg-estado-verde/10 text-estado-verde' : 'border-estado-rojo/30 bg-estado-rojo/10 text-estado-rojo'}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-tempel-border bg-tempel-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-tempel-bg/60 text-sm text-tempel-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Fecha de registro</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-10 text-center text-tempel-muted">No hay usuarios para mostrar.</td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-t border-tempel-border hover:bg-tempel-bg/30">
                    <td className="px-4 py-3 text-tempel-text">{usuario.nombre}</td>
                    <td className="px-4 py-3 text-tempel-muted">{usuario.email}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={roleLabels[usuario.rol] || usuario.rol} tone={roleColors[usuario.rol] || 'slate'} />
                    </td>
                    <td className="px-4 py-3 text-tempel-muted">
                      {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openEditModal(usuario)} className="rounded-lg border border-tempel-border bg-tempel-bg px-3 py-1.5 text-sm text-tempel-text hover:border-tempel-blue">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-tempel-border bg-tempel-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Personal interno</p>
                <h2 className="mt-2 text-2xl font-semibold text-tempel-text">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-tempel-border bg-tempel-bg p-2 text-tempel-muted hover:text-tempel-text">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                  placeholder="Ej: Ana Torres"
                />
                {errors.nombre ? <p className="mt-1 text-sm text-estado-rojo">{errors.nombre}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                  placeholder="nombre@tempel.com"
                />
                {errors.email ? <p className="mt-1 text-sm text-estado-rojo">{errors.email}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm text-tempel-muted">{editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                  placeholder={editingId ? 'Dejar vacío para conservar la actual' : '••••••••'}
                />
                {errors.password ? <p className="mt-1 text-sm text-estado-rojo">{errors.password}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Rol</label>
                <select
                  value={form.rol}
                  onChange={(event) => setForm({ ...form, rol: event.target.value, especialidad: event.target.value === 'entrenador' ? form.especialidad : '' })}
                  className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none"
                >
                  <option value="administrador">Administrador</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="entrenador">Entrenador</option>
                </select>
              </div>

              {form.rol === 'entrenador' ? (
                <div>
                  <label className="mb-2 block text-sm text-tempel-muted">Especialidad</label>
                  <input
                    value={form.especialidad}
                    onChange={(event) => setForm({ ...form, especialidad: event.target.value })}
                    className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none"
                    placeholder="Ej: Fuerza funcional"
                  />
                  {errors.especialidad ? <p className="mt-1 text-sm text-estado-rojo">{errors.especialidad}</p> : null}
                </div>
              ) : null}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-tempel-border bg-tempel-bg px-4 py-2.5 text-tempel-text">
                  Cancelar
                </button>
                <button type="submit" className="rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
                  {editingId ? 'Guardar cambios' : 'Guardar usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

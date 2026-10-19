import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, HelpCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  fecha_nacimiento: '',
  password: ''
};

export default function SociosPage() {
  const [socios, setSocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [createdInfo, setCreatedInfo] = useState(null); // { email, password } to show after creation
  const [search, setSearch] = useState('');

  // membership modal
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [membresias, setMembresias] = useState([]);
  const [selectedMembresia, setSelectedMembresia] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');

  const loadSocios = async () => {
    try {
      const response = await api.get('/socios');
      setSocios(response.data);
    } catch (error) {
      setSocios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSocios();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    // Email is generated automatically by the backend when left empty; only validate format if user somehow provided one
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && form.email.trim() && !emailRegex.test(form.email)) nextErrors.email = 'El email no tiene un formato válido.';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const response = await api.post('/socios', {
        ...form,
        password: form.password || 'Tempel2026!'
      });

      const createdEmail = response.data.email;
      const createdPassword = response.data.password;

      setFeedback({
        type: 'success',
        message: `Socio creado correctamente.`
      });
      setCreatedInfo({ email: createdEmail, password: createdPassword });
      setForm(initialForm);
      setErrors({});
      setIsOpen(false);
      await loadSocios();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'No se pudo crear el socio.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Gestión</p>
          <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Socios</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]"
        >
          <Plus className="h-4 w-4" />
          Nuevo socio
        </button>
      </div>

      {feedback.message ? (
        <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-estado-verde/30 bg-estado-verde/10 text-estado-verde' : 'border-estado-rojo/30 bg-estado-rojo/10 text-estado-rojo'}`}>
          {feedback.message}
        </div>
      ) : null}

      <div className="rounded-2xl border border-tempel-border bg-tempel-card p-4">
        <div className="flex items-center gap-3 rounded-xl border border-tempel-border bg-tempel-bg/60 px-3 py-2.5 text-tempel-muted">
          <Search className="h-4 w-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-tempel-text placeholder:text-tempel-muted focus:outline-none"
            placeholder="Buscar por nombre, email o membresía"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-tempel-border bg-tempel-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-tempel-bg/60 text-sm text-tempel-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Membresía</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-10 text-center text-tempel-muted">Cargando...</td>
                </tr>
              ) : (
                socios.map((socio) => (
                  <tr key={socio.id} className="border-t border-tempel-border transition hover:bg-tempel-bg/30">
                    <td className="px-4 py-3">
                      <Link to={`/socios/${socio.id}`} className="flex items-center gap-3 text-tempel-text hover:text-tempel-blue">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tempel-blue/15 text-sm font-semibold text-tempel-blue">
                          {socio.nombre?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-medium">{socio.nombre}</p>
                          <p className="text-xs text-tempel-muted">{socio.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-tempel-muted">{socio.membresia || 'Sin plan'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSocio(socio);
                          setAssignError('');
                          setSelectedMembresia(null);
                          setMembershipOpen(true);
                          // load memberships
                          (async () => {
                            try {
                              const res = await api.get('/membresias');
                              setMembresias(res.data || []);
                            } catch (err) {
                              setMembresias([]);
                            }
                          })();
                        }}
                        className="inline-flex items-center"
                      >
                        <StatusBadge label={socio.status?.label || 'Sin membresía'} tone={socio.status?.color || 'slate'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-tempel-muted">{socio.telefono || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {membershipOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl border border-tempel-border bg-tempel-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Membresía</p>
                    <h3 className="mt-1 text-xl font-semibold text-tempel-text">Asignar membresía a {selectedSocio?.nombre}</h3>
                  </div>
                  <button type="button" onClick={() => setMembershipOpen(false)} className="rounded-full border border-tempel-border bg-tempel-bg p-2 text-tempel-muted hover:text-tempel-text">
                    <X className="h-4 w-4" />
                  </button>
            </div>

            <div className="space-y-3">
                  <div>
                    <label className="text-sm text-tempel-muted">Elegir membresía</label>
                    <select value={selectedMembresia || ''} onChange={(e) => setSelectedMembresia(e.target.value)} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-2 text-tempel-text">
                      <option value="">-- Seleccionar --</option>
                      {membresias.map((m) => (
                        <option key={m.id} value={m.id}>{m.tipo} — {m.duracion_dias} días — ${m.precio}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input id="validado" type="checkbox" checked={true} readOnly className="h-4 w-4" />
                    <label htmlFor="validado" className="text-sm text-tempel-muted">Validado por recepcionista (marcar si es pago en sitio)</label>
                  </div>

                  {assignError ? <p className="text-sm text-estado-rojo">{assignError}</p> : null}

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setMembershipOpen(false)} className="rounded-xl border border-tempel-border bg-tempel-bg px-4 py-2.5 text-tempel-text">Cancelar</button>
                    <button type="button" onClick={async () => {
                      if (!selectedMembresia) { setAssignError('Selecciona una membresía.'); return; }
                      setAssignLoading(true);
                      setAssignError('');
                      try {
                        await api.post('/membresias/asignar', { id_socio: selectedSocio.id, id_membresia: Number(selectedMembresia), validado_por_recepcionista: true });
                        setMembershipOpen(false);
                        setSelectedSocio(null);
                        await loadSocios();
                        setFeedback({ type: 'success', message: 'Membresía asignada correctamente.' });
                      } catch (err) {
                        setAssignError(err?.response?.data?.message || 'No se pudo asignar la membresía.');
                      } finally {
                        setAssignLoading(false);
                      }
                    }} className="rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white">{assignLoading ? 'Asignando...' : 'Asignar membresía'}</button>
                  </div>
            </div>
          </div>
        </div>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-tempel-border bg-tempel-card p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Registro</p>
                <h2 className="mt-2 text-2xl font-semibold text-tempel-text">Nuevo socio</h2>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-tempel-border bg-tempel-bg p-2 text-tempel-muted hover:text-tempel-text">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Nombre</label>
                <input value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none" />
                {errors.nombre ? <p className="mt-1 text-sm text-estado-rojo">{errors.nombre}</p> : null}
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm text-tempel-muted">
                  <span>Email (se generará automáticamente)</span>
                  <HelpCircle className="h-4 w-4 text-tempel-muted" title="Se generará en formato nombre.apellido@tempel.com. Si existe un duplicado se añadirá un número al final (ej: nombre.apellido1@tempel.com)." />
                </label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Se generará automáticamente" disabled className="w-full rounded-xl border border-tempel-border bg-tempel-bg/50 px-3 py-3 text-tempel-text focus:outline-none" />
                {errors.email ? <p className="mt-1 text-sm text-estado-rojo">{errors.email}</p> : null}
              </div>
              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Teléfono</label>
                <input value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Fecha de nacimiento</label>
                <input type="date" value={form.fecha_nacimiento} onChange={(event) => setForm({ ...form, fecha_nacimiento: event.target.value })} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-tempel-muted">Contraseña temporal (opcional)</label>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Dejar vacío para usar Tempel2026!" className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl border border-tempel-border bg-tempel-bg px-4 py-2.5 text-tempel-text">Cancelar</button>
                <button type="submit" className="rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">Guardar socio</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {createdInfo ? (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-tempel-border bg-tempel-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-tempel-text">Socio creado</h3>
            <p className="mt-3 text-sm text-tempel-muted">Copia la información y entrégasela al socio:</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-tempel-border bg-tempel-bg/60 p-3">
                <div className="text-xs text-tempel-muted">Correo</div>
                <div className="mt-1 font-medium text-tempel-text break-words">{createdInfo.email}</div>
              </div>
              <div className="rounded-xl border border-tempel-border bg-tempel-bg/60 p-3">
                <div className="text-xs text-tempel-muted">Contraseña temporal</div>
                <div className="mt-1 font-medium text-tempel-text break-words">{createdInfo.password}</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(`Email: ${createdInfo.email} \nPassword: ${createdInfo.password}`); }}
                className="rounded-xl border border-tempel-border bg-tempel-bg px-4 py-2.5 text-tempel-text"
              >
                Copiar
              </button>
              <button
                type="button"
                onClick={() => setCreatedInfo(null)}
                className="rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}

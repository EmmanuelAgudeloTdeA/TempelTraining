import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BriefcaseBusiness, CalendarClock, Phone } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const ringData = [{ name: 'dias', value: 65, fill: '#29B6F6' }];

export default function SocioDetailPage() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function loadPerfil() {
      try {
        const response = await api.get(`/socios/${id}`);
        setPerfil(response.data);
      } catch (error) {
        setPerfil(null);
      }
    }

    loadPerfil();
  }, [id]);

  if (!perfil) {
    return <div className="text-tempel-muted">Cargando perfil...</div>;
  }

  const progress = Math.max(10, (Math.min(perfil.dias_restantes || 0, 30) / 30) * 100);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tempel-blue/20 text-2xl font-semibold text-tempel-blue">
              {perfil.nombre?.charAt(0) || 'S'}
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-tempel-text">{perfil.nombre}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-tempel-muted">
                <StatusBadge label={perfil.membresia || 'Plan básico'} tone="blue" />
                <span>{perfil.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-tempel-border bg-tempel-bg/60 px-4 py-2 text-sm text-tempel-muted">
            <Phone className="h-4 w-4 text-tempel-blue" />
            {perfil.telefono || 'Sin teléfono'}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
        <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
          <div className="flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="58%" outerRadius="90%" barSize={18} data={ringData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={10} fill={perfil.status?.color === 'green' ? '#22C55E' : perfil.status?.color === 'yellow' ? '#EAB308' : perfil.status?.color === 'orange' ? '#F97316' : '#EF4444'} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="-mt-16 text-center">
            <p className="text-3xl font-semibold text-tempel-text">{perfil.dias_restantes || 0}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-tempel-muted">Días restantes</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-tempel-muted">
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/50 p-3">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-estado-verde" /> Al día</div>
            </div>
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/50 p-3">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-estado-amarillo" /> 5-3 días</div>
            </div>
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/50 p-3">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-estado-naranja" /> 2-1 días</div>
            </div>
            <div className="rounded-xl border border-tempel-border bg-tempel-bg/50 p-3">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-estado-rojo" /> Vencida</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <BriefcaseBusiness className="h-5 w-5 text-tempel-blue" />
              <h2 className="text-xl font-semibold text-tempel-text">Historial de pagos</h2>
            </div>
            <div className="space-y-3">
              {[
                { nombre: 'Membresía mensual', fecha: '12 jul 2026', monto: '$49.990', estado: 'Pagado' },
                { nombre: 'Renovación', fecha: '12 jun 2026', monto: '$49.990', estado: 'Pagado' },
                { nombre: 'Entrenamiento personal', fecha: '02 jun 2026', monto: '$19.900', estado: 'Pagado' }
              ].map((item) => (
                <div key={item.fecha} className="flex items-center justify-between rounded-xl border border-tempel-border bg-tempel-bg/40 p-3">
                  <div>
                    <p className="font-medium text-tempel-text">{item.nombre}</p>
                    <p className="text-sm text-tempel-muted">{item.fecha}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-tempel-text">{item.monto}</p>
                    <p className="text-xs text-estado-verde">{item.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-tempel-blue" />
              <h2 className="text-xl font-semibold text-tempel-text">Reservas recientes</h2>
            </div>
            <div className="space-y-3">
              {[
                { titulo: 'Fuerza funcional', fecha: 'Lun 18:00', estado: 'Confirmada' },
                { titulo: 'Cardio + movilidad', fecha: 'Mié 18:30', estado: 'Pendiente' },
                { titulo: 'Entrenamiento guiado', fecha: 'Vie 17:00', estado: 'Completada' }
              ].map((item) => (
                <div key={item.titulo} className="flex items-center justify-between rounded-xl border border-tempel-border bg-tempel-bg/40 p-3">
                  <div>
                    <p className="font-medium text-tempel-text">{item.titulo}</p>
                    <p className="text-sm text-tempel-muted">{item.fecha}</p>
                  </div>
                  <StatusBadge label={item.estado} tone={item.estado === 'Confirmada' ? 'green' : item.estado === 'Pendiente' ? 'yellow' : 'blue'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

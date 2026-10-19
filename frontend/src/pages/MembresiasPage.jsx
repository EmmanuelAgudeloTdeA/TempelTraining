import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';

export default function MembresiasPage() {
  const [planes, setPlanes] = useState([]);

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await api.get('/membresias');
        setPlanes(response.data);
      } catch (error) {
        setPlanes([]);
      }
    }

    loadPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Planes</p>
          <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Membresías</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
          <Plus className="h-4 w-4" />
          Nueva membresía
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {planes.map((plan) => (
          <div key={plan.id} className="rounded-3xl border border-tempel-border bg-tempel-card p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-tempel-muted">{plan.tipo}</p>
            <h2 className="mt-4 text-3xl font-semibold text-tempel-text">${new Intl.NumberFormat('es-CL').format(plan.precio || 0)}</h2>
            <p className="mt-2 text-sm text-tempel-muted">{plan.duracion_dias || 30} días de acceso</p>
            <div className="mt-6 rounded-xl border border-tempel-border bg-tempel-bg/40 p-3 text-sm text-tempel-muted">
              {plan.tipo === 'estudiante' ? 'Validación requerida por recepcionista' : 'Cobertura completa del gimnasio'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

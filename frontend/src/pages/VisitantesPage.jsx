import { useState } from 'react';
import StatusBadge from '../components/StatusBadge';

const history = [
  { nombre: 'Mateo Aliaga', documento: '20456789', tipo: 'adulto', pase: 'normal', fecha: 'Hoy 09:20' },
  { nombre: 'Lucía Pardo', documento: '22634122', tipo: 'nino', pase: 'domingo_infantil', fecha: 'Hoy 11:15' }
];

export default function VisitantesPage() {
  const [form, setForm] = useState({ nombre: '', documento: '', tipo_visitante: 'adulto', nombre_acudiente: '', tipo_pase: 'normal', precio_pagado: '0' });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Control</p>
        <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Visitantes / Pase diario</h1>

        <div className="mt-6 space-y-4">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none" />
          <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Documento" className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none" />
          <select value={form.tipo_visitante} onChange={(e) => setForm({ ...form, tipo_visitante: e.target.value })} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none">
            <option value="adulto">Adulto</option>
            <option value="nino">Niño</option>
          </select>
          <input value={form.nombre_acudiente} onChange={(e) => setForm({ ...form, nombre_acudiente: e.target.value })} placeholder="Nombre acudiente" className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none" />
          <select value={form.tipo_pase} onChange={(e) => setForm({ ...form, tipo_pase: e.target.value })} className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none">
            <option value="normal">Pase normal</option>
            <option value="domingo_infantil">Domingo infantil</option>
          </select>
          <input value={form.precio_pagado} onChange={(e) => setForm({ ...form, precio_pagado: e.target.value })} placeholder="Precio pagado" className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text placeholder:text-tempel-muted focus:border-tempel-blue focus:outline-none" />

          <button className="w-full rounded-xl bg-tempel-blue px-4 py-3 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
            Registrar asistencia
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-tempel-text">Historial</h2>
          <StatusBadge label="Hoy" tone="blue" />
        </div>

        <div className="space-y-3">
          {history.map((visit) => (
            <div key={`${visit.documento}-${visit.fecha}`} className="flex items-center justify-between rounded-2xl border border-tempel-border bg-tempel-bg/40 p-3">
              <div>
                <p className="font-medium text-tempel-text">{visit.nombre}</p>
                <p className="text-sm text-tempel-muted">{visit.documento} • {visit.tipo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-tempel-text">{visit.pase}</p>
                <p className="text-xs text-tempel-muted">{visit.fecha}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

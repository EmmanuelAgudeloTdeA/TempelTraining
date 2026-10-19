import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

const horario = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const fallbackReservations = [
  { id: 1, dia: 'Martes', hora: '18:00', entrenador: 'Alonso Vega', socio: 'Sofía Romero', estado: 'Confirmada' },
  { id: 2, dia: 'Jueves', hora: '16:00', entrenador: 'Alonso Vega', socio: 'Mateo Silva', estado: 'Pendiente' },
  { id: 3, dia: 'Sábado', hora: '10:00', entrenador: 'Alonso Vega', socio: 'Valentina Paredes', estado: 'Completada' }
];

export default function ReservasPage() {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    setReservas(fallbackReservations);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Agenda</p>
          <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Reservas</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
          <Plus className="h-4 w-4" />
          Nueva reserva
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-tempel-border bg-tempel-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="border-r border-tempel-border bg-tempel-bg/60 p-3 text-sm font-medium text-tempel-muted">Hora</th>
                {dias.map((dia) => (
                  <th key={dia} className="border-r border-tempel-border bg-tempel-bg/60 p-3 text-sm font-medium text-tempel-muted">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horario.map((hora) => (
                <tr key={hora}>
                  <td className="border-r border-t border-tempel-border bg-tempel-bg/40 p-3 text-sm text-tempel-muted">{hora}</td>
                  {dias.map((dia) => {
                    const match = reservas.find((reserva) => reserva.dia === dia && reserva.hora === hora);

                    return (
                      <td key={`${dia}-${hora}`} className="border-r border-t border-tempel-border bg-tempel-card p-2 align-top">
                        {match ? (
                          <div className="rounded-xl border border-tempel-blue/30 bg-tempel-blue/10 p-2 text-xs text-tempel-text">
                            <p className="font-medium">{match.entrenador}</p>
                            <p className="mt-1 text-tempel-muted">{match.socio}</p>
                            <span className="mt-2 inline-block rounded-full bg-tempel-bg/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-tempel-blue">
                              {match.estado}
                            </span>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

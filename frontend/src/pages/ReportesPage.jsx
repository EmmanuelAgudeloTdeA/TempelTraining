import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const lineData = [
  { name: 'Ene', ventas: 12000 },
  { name: 'Feb', ventas: 19000 },
  { name: 'Mar', ventas: 16500 },
  { name: 'Abr', ventas: 23000 },
  { name: 'May', ventas: 27000 },
  { name: 'Jun', ventas: 33000 }
];

const barData = [
  { name: 'M', activos: 45 },
  { name: 'T', activos: 62 },
  { name: 'W', activos: 58 },
  { name: 'T', activos: 74 },
  { name: 'F', activos: 68 },
  { name: 'S', activos: 80 }
];

const StatsCard = ({ title, value, change, subtitle, chartType = 'line' }) => (
  <div className="rounded-3xl border border-tempel-border bg-tempel-card p-5">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-tempel-muted">{title}</p>
      <span className="rounded-full bg-tempel-blue/10 px-2 py-1 text-xs text-tempel-blue">{change}</span>
    </div>
    <div className="mb-3 flex items-end justify-between gap-4">
      <h3 className="text-3xl font-semibold text-tempel-text">{value}</h3>
      <p className="text-xs text-tempel-muted">{subtitle}</p>
    </div>
    <div className="h-20">
      {chartType === 'line' ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineData}>
            <Line type="monotone" dataKey="ventas" stroke="#29B6F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <Bar dataKey="activos" fill="#29B6F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Indicadores</p>
        <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Reportes</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Ventas del mes" value="$36.500" change="+12.4%" subtitle="vs mes anterior" chartType="line" />
        <StatsCard title="Socios activos" value="1.248" change="+8.3%" subtitle="nuevos this month" chartType="bar" />
        <StatsCard title="Membresías por vencer" value="18" change="-4.7%" subtitle="proximos 7 días" chartType="line" />
        <StatsCard title="Visitantes de pase diario" value="94" change="+17.1%" subtitle="hoy" chartType="bar" />
      </div>
    </div>
  );
}

const palette = {
  green: 'bg-estado-verde/15 text-estado-verde border border-estado-verde/30',
  yellow: 'bg-estado-amarillo/15 text-estado-amarillo border border-estado-amarillo/30',
  orange: 'bg-estado-naranja/15 text-estado-naranja border border-estado-naranja/30',
  red: 'bg-estado-rojo/15 text-estado-rojo border border-estado-rojo/30',
  blue: 'bg-tempel-blue/15 text-tempel-blue border border-tempel-blue/30',
  slate: 'bg-slate-500/10 text-slate-200 border border-slate-500/30'
};

export default function StatusBadge({ label, tone = 'slate' }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${palette[tone] || palette.slate}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

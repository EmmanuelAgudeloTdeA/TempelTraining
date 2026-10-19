const blocks = [
  {
    title: 'Semana 1 - Fuerza base',
    description: 'Enfoque en técnica, movilidad y activación muscular. 4 series, 6-8 repeticiones de ejercicios compuestos con pausas cortas.'
  },
  {
    title: 'Semana 2 - Resistencia funcional',
    description: 'Circuitos de piernas, tronco y fuerza de agarre con intervalos de 40 a 60 segundos y 2-3 minutos de recuperación.'
  },
  {
    title: 'Semana 3 - Hipertrofia',
    description: 'Trabajos de volumen en grupos musculares específicos, con 3-4 series por ejercicio y énfasis en la progresión de carga.'
  },
  {
    title: 'Semana 4 - Recuperación y movilidad',
    description: 'Sesiones de activación, estiramiento y cardio ligero para consolidar resultados sin sobrecargar el sistema nervioso.'
  }
];

export default function MetodoPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Programa</p>
        <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Método de entrenamiento</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="rounded-3xl border border-tempel-border bg-tempel-card p-5">
            <h2 className="text-xl font-semibold text-tempel-text">{block.title}</h2>
            <p className="mt-3 text-tempel-muted">{block.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

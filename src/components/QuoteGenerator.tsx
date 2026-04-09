import { useState, useMemo } from 'preact/hooks';

interface Cita {
  id: number;
  texto: string;
  autor: string;
  obra: string;
  anio: number;
  era: string;
}

interface Props {
  citas: Cita[];
}

export default function QuoteGenerator({ citas }: Props) {
  const [filtroAutor, setFiltroAutor] = useState('');
  const [filtroEra, setFiltroEra] = useState('');
  const [citaActual, setCitaActual] = useState<Cita>(citas[0]);

  const autores = useMemo(() => [...new Set(citas.map(c => c.autor))].sort(), [citas]);
  const eras = useMemo(() => [...new Set(citas.map(c => c.era))].sort(), [citas]);

  const filtradas = useMemo(() => {
    return citas.filter(c => {
      if (filtroAutor && c.autor !== filtroAutor) return false;
      if (filtroEra && c.era !== filtroEra) return false;
      return true;
    });
  }, [citas, filtroAutor, filtroEra]);

  function generarCita() {
    const pool = filtradas.length > 0 ? filtradas : citas;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setCitaActual(random);
  }

  return (
    <div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select value={filtroAutor} onChange={(e) => setFiltroAutor((e.target as HTMLSelectElement).value)}
          class="px-4 py-2 border border-epoca-violeta-claro rounded-lg bg-white focus:outline-none focus:border-epoca-rosa">
          <option value="">Todos los autores</option>
          {autores.map(a => <option value={a}>{a}</option>)}
        </select>
        <select value={filtroEra} onChange={(e) => setFiltroEra((e.target as HTMLSelectElement).value)}
          class="px-4 py-2 border border-epoca-violeta-claro rounded-lg bg-white focus:outline-none focus:border-epoca-rosa">
          <option value="">Todas las épocas</option>
          {eras.map(e => <option value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
        </select>
      </div>

      <div class="card-epoca bg-gradient-to-br from-epoca-crema to-white p-8 text-center mb-6 min-h-48">
        <span class="ornament text-4xl block mb-4">❝</span>
        <blockquote class="font-playfair text-xl italic text-epoca-marron leading-relaxed mb-4">
          {citaActual.texto}
        </blockquote>
        <footer class="text-sm text-epoca-marron-medio">
          — <cite class="not-italic font-medium">{citaActual.autor}</cite>
          {citaActual.obra && <span>, <em>{citaActual.obra}</em> ({citaActual.anio})</span>}
        </footer>
      </div>

      <div class="text-center">
        <button onClick={generarCita} class="btn-primary">
          Nueva cita ✨
        </button>
      </div>
    </div>
  );
}

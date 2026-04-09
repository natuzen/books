import { useEffect, useRef } from 'preact/hooks';

interface Location {
  id: number;
  nombre: string;
  ciudad: string;
  pais: string;
  descripcion: string;
  lat: number;
  lon: number;
  obras_relacionadas: string[];
  tipo: string;
}

interface Props {
  locations: Location[];
}

export default function LiteraryMap({ locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInitialized.current) return;
    mapInitialized.current = true;

    import('leaflet').then((L) => {
      // Fix default icon paths
      const iconDefault = L.Icon.Default.prototype as unknown as Record<string, unknown>;
      delete iconDefault['_getIconUrl'];
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView([51.5, -0.5], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      locations.forEach(loc => {
        const obras = loc.obras_relacionadas.slice(0, 2).join(', ');
        const popup = `
          <div style="font-family: Georgia, serif; max-width: 200px;">
            <strong style="color: #3D2C2E;">${loc.nombre}</strong><br/>
            <small style="color: #6B5658;">${loc.ciudad}, ${loc.pais}</small><br/>
            <p style="margin: 4px 0; font-size: 12px; color: #3D2C2E;">${loc.descripcion}</p>
            ${obras ? `<p style="font-size: 11px; color: #B8A0C8; margin-top: 4px;"><em>${obras}</em></p>` : ''}
          </div>
        `;
        L.marker([loc.lat, loc.lon])
          .bindPopup(popup)
          .addTo(map);
      });
    });
  }, []);

  return (
    <div>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '12px' }} />
    </div>
  );
}

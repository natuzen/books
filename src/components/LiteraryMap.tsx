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

const PUSHPIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
  <path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z" fill="#6B21A8"/>
  <circle cx="12" cy="8" r="3.5" fill="#FDF8F4"/>
  <path d="M12 0C7.6 0 4 3.6 4 8c0 6 8 16 8 16s8-10 8-16c0-4.4-3.6-8-8-8z" fill="none" stroke="#B8860B" stroke-width="1.5"/>
</svg>`;

const PUSHPIN_DATA_URI = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PUSHPIN_SVG)}`;

export default function LiteraryMap({ locations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInitialized.current) return;
    mapInitialized.current = true;

    import('leaflet').then((L) => {
      const pushpinIcon = L.icon({
        iconUrl: PUSHPIN_DATA_URI,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
      });

      const map = L.map(mapRef.current!).setView([48, 10], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      locations.forEach(loc => {
        const obras = loc.obras_relacionadas.slice(0, 2).join(', ');
        const popup = `
          <div style="font-family: Georgia, serif; max-width: 220px;">
            <strong style="color: #3D2C2E; font-size: 14px;">${loc.nombre}</strong><br/>
            <small style="color: #6B5658;">📍 ${loc.ciudad}, ${loc.pais}</small><br/>
            <p style="margin: 6px 0; font-size: 12px; color: #3D2C2E; line-height: 1.4;">${loc.descripcion}</p>
            ${obras ? `<p style="font-size: 11px; color: #6B21A8; margin-top: 4px; font-style: italic;"><em>${obras}</em></p>` : ''}
          </div>
        `;
        L.marker([loc.lat, loc.lon], { icon: pushpinIcon })
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

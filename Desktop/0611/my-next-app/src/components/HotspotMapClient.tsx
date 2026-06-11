'use client';

import { useEffect, useRef, useState } from 'react';
import type { Hotspot, HotspotCategory } from '@/data/hotspots';
import { categoryColors } from '@/data/hotspots';

interface Props {
  hotspots: Hotspot[];
  selectedCategory: HotspotCategory | '전체';
}

export default function HotspotMapClient({ hotspots, selectedCategory }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  const [selected, setSelected] = useState<Hotspot | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let mapInstance: ReturnType<typeof import('leaflet')['map']> | null = null;

    import('leaflet').then((L) => {
      if (leafletMapRef.current || !mapRef.current) return;

      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapInstance = L.map(mapRef.current).setView([21.0285, 105.8542], 13);
      leafletMapRef.current = mapInstance;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(mapInstance);

      hotspots.forEach((spot) => {
        const color = categoryColors[spot.category];
        const markerHtml = `
          <div style="
            background:${color};
            color:white;
            border-radius:50%;
            width:32px;
            height:32px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:14px;
            font-weight:bold;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
            cursor:pointer;
          ">${spot.id}</div>`;

        const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

        const marker = L.marker([spot.lat, spot.lng], { icon }).addTo(mapInstance!);
        marker.bindTooltip(`<b>${spot.nameKo}</b><br><small>${spot.category}</small>`, {
          direction: 'top', offset: [0, -10],
        });
        marker.on('click', () => setSelected(spot));
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = selectedCategory === '전체'
    ? hotspots
    : hotspots.filter(h => h.category === selectedCategory);

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Map */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-md border border-stone-200" style={{ minHeight: 480 }}>
        <div ref={mapRef} style={{ height: '100%', minHeight: 480 }} />
      </div>

      {/* Sidebar list */}
      <div className="lg:w-80 flex flex-col gap-2 max-h-[480px] overflow-y-auto">
        {visible.map((spot) => (
          <button
            key={spot.id}
            onClick={() => setSelected(spot === selected ? null : spot)}
            className={`text-left p-3 rounded-xl border transition-all ${
              selected?.id === spot.id
                ? 'border-green-500 bg-green-50 shadow-sm'
                : 'border-stone-200 bg-white hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: categoryColors[spot.category] }}
              >
                {spot.id}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-stone-800 text-sm">{spot.nameKo}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs text-white"
                    style={{ backgroundColor: categoryColors[spot.category] }}
                  >
                    {spot.category}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{spot.description}</p>
                <p className="text-xs text-stone-400 mt-0.5">💰 {spot.priceRange} · ⭐ {spot.rating}/5</p>
              </div>
            </div>

            {selected?.id === spot.id && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <p className="text-xs text-stone-600 mb-1">{spot.description}</p>
                <p className="text-xs text-green-700 font-medium">💡 {spot.tip}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

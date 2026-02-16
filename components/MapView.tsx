/**
 * (c) 2026 Bondify. All rights reserved.
 * Proprietary and Confidential.
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { BusEntity, ChaosReport, BusStop } from '../types';
import { BusMarker } from './BusMarker';
import { ChaosMarker } from './ChaosMarker';
import { UserMarker } from './UserMarker';
import { StopMarker } from './StopMarker';
import { mapConfig } from '../config/mapConfig';
import L from 'leaflet';

interface MapViewProps {
  buses: BusEntity[];
  reports: ChaosReport[];
  onBusClick: (bus: BusEntity) => void;
  selectedBusId: string | undefined;
  userLocation?: { lat: number; lng: number } | null;
  onMapReady?: (map: L.Map) => void;
  stops?: BusStop[];
}

// Buenos Aires Center (Palermo/Santa Fe area)
const DEFAULT_CENTER: [number, number] = [-34.5828, -58.4215];

// Componente interno para ajustar el mapa solo la primera vez
function MapController({ buses }: { buses: BusEntity[] }) {
  const map = useMap();
  const [hasAdjusted, setHasAdjusted] = React.useState(false);

  useEffect(() => {
    // Solo ajustar el mapa la PRIMERA vez que hay colectivos
    if (buses.length > 0 && !hasAdjusted) {
      // Crear bounds con todas las posiciones de los colectivos
      const bounds = L.latLngBounds(
        buses.map(bus => [bus.lat, bus.lng] as [number, number])
      );

      // Ajustar el mapa para mostrar todos los colectivos
      if (buses.length === 1) {
        map.setView([buses[0].lat, buses[0].lng], 14);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }

      setHasAdjusted(true);
    }
  }, [buses, map, hasAdjusted]);

  return null;
}

// Componente para exponer la instancia del mapa
function MapEventListener({ onReady }: { onReady?: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (onReady) onReady(map);
  }, [map, onReady]);
  return null;
}

export const MapView: React.FC<MapViewProps> = ({ buses, reports, onBusClick, selectedBusId, userLocation, onMapReady, stops = [] }) => {
  // Get tile configuration from mapConfig
  const { tiles } = mapConfig;

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      {/* Fondo con gradiente mientras cargan los tiles */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
          opacity: 0.3
        }}
      />

      {/* Overlay decorativo tipo mapa */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.03) 0px, rgba(148, 163, 184, 0.03) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.03) 0px, rgba(148, 163, 184, 0.03) 1px, transparent 1px, transparent 60px)
          `,
        }}
      />

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        minZoom={11}
        maxZoom={18}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        className="leaflet-map"
      >
        {/* Tiles configurables - cambiar proveedor via VITE_MAP_PROVIDER */}
        <TileLayer
          attribution={tiles.attribution}
          url={tiles.url}
          subdomains={tiles.subdomains || []}
          maxZoom={tiles.maxZoom}
          minZoom={10}
          opacity={1}
          errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />

        {/* Move Zoom Control to bottom right */}
        <ZoomControl position="bottomright" />

        {/* Controlador automático del mapa */}
        <MapController buses={buses} />

        {/* Render Buses */}
        {buses.map(bus => (
          <BusMarker
            key={bus.id}
            bus={bus}
            onClick={onBusClick}
            isSelected={selectedBusId === bus.id}
          />
        ))}

        {/* Render Reports */}
        {reports.map(report => (
          <ChaosMarker key={report.id} report={report} />
        ))}

        {/* Render User Location */}
        {userLocation && <UserMarker location={userLocation} />}

        {/* Render Bus Stops */}
        {stops.map(stop => (
          <StopMarker key={stop.id} stop={stop} />
        ))}

        <MapEventListener onReady={onMapReady} />
      </MapContainer>

      {/* Mensaje informativo si los tiles no cargan */}
      <div className="absolute bottom-4 left-4 z-[100] bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg text-xs max-w-xs">
        <p className="text-slate-700">
          <span className="font-bold">🗺️ Mapa Activo:</span> Los colectivos se muestran en tiempo real.
          <span className="text-slate-500 block mt-1">
            (Las calles pueden no verse completamente en preview, pero funcionará en producción)
          </span>
        </p>
      </div>
    </div>
  );
};

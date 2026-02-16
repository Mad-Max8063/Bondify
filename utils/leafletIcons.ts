import L from 'leaflet';
import { BusEntity, BusStatus, ChaosReport, ReportType } from '../types';

// Helper to render Lucide icons as SVG strings for Leaflet HTML
// Note: We are using simple emoji/strings or simplistic SVG structures for the raw HTML 
// to avoid complex React-to-HTML rendering inside the L.divIcon function for performance.

export const createBusIcon = (bus: BusEntity, isSelected: boolean) => {
  let colorClass = 'bg-slate-400/80 border-slate-200 grayscale'; // Ghost
  let emoji = '👻'; 
  let animation = '';
  let label = bus.line;

  if (bus.status === BusStatus.VERIFIED) {
    colorClass = 'bg-green-500 border-white shadow-green-500/40';
    emoji = '🚌';
    animation = 'animate-pulse-slow';
  } else if (bus.status === 'ESTIMATED') {
    colorClass = 'bg-gray-400 border-white/80 opacity-70';
    emoji = '⏱️';
    label = `${bus.line} (est)`;
  } else if (bus.status === BusStatus.TRAIL) {
    colorClass = 'bg-yellow-400/90 border-white/80';
    emoji = '⏳';
  } else if (bus.status === BusStatus.PROBLEM) {
    colorClass = 'bg-red-600 border-white shadow-red-500/40';
    emoji = '⚠️';
    animation = 'animate-pulse';
  }

  const scaleClass = isSelected ? 'scale-125 z-[100]' : 'scale-100 hover:scale-110';
  const badgeHtml = bus.passengers > 0 ? `
    <div class="absolute -bottom-2 right-0 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center border border-white">
      👥 ${bus.passengers}
    </div>
  ` : '';

  return L.divIcon({
    className: 'leaflet-div-icon', // defined in index.html to remove defaults
    html: `
      <div class="relative transition-transform duration-300 ${scaleClass} flex flex-col items-center justify-center">
        <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg text-lg ${colorClass} ${animation}">
          ${emoji}
        </div>
        <div class="absolute -top-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm">
          ${label}
        </div>
        ${badgeHtml}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Center
  });
};

export const createChaosIcon = (report: ChaosReport) => {
  let icon = '⚠️';
  let color = 'bg-red-600';
  
  switch (report.type) {
    case ReportType.PICKET: icon = '🛑'; color = 'bg-orange-600'; break; // Piquete
    case ReportType.ACCIDENT: icon = '💥'; color = 'bg-red-600'; break; // Accidente
    case ReportType.BROKEN: icon = '🔧'; color = 'bg-slate-700'; break; // Roto
    case ReportType.STATION_CLOSED: icon = '🚫'; color = 'bg-red-800'; break; // Cerrado
  }

  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="flex flex-col items-center justify-center animate-bounce">
        <div class="w-8 h-8 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-sm">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32], // Bottom center
  });
};
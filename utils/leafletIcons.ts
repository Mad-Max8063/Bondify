import L from 'leaflet';
import { BusEntity, BusStatus, ChaosReport, ReportType } from '../types';

export const createBusIcon = (bus: BusEntity, isSelected: boolean) => {
  // Select color schemes based on status
  let neonColor = '#10B981'; // verified green
  let stopColor = '#047857';
  let animation = '';
  
  if (bus.status === BusStatus.VERIFIED) {
    neonColor = '#10B981';
    stopColor = '#047857';
    animation = 'animate-pulse-slow';
  } else if (bus.status === BusStatus.ESTIMATED) {
    neonColor = '#64748B';
    stopColor = '#334155';
  } else if (bus.status === BusStatus.TRAIL) {
    neonColor = '#F59E0B';
    stopColor = '#B45309';
  } else if (bus.status === BusStatus.PROBLEM) {
    neonColor = '#EF4444';
    stopColor = '#991B1B';
    animation = 'animate-pulse';
  } else { // GHOST
    neonColor = '#818CF8';
    stopColor = '#312E81';
  }

  const scaleClass = isSelected ? 'scale-[1.35] z-[100]' : 'scale-100 hover:scale-110';
  const badgeHtml = bus.passengers > 0 ? `
    <div class="absolute -bottom-2 -left-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center border border-white/20 shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
      👥 ${bus.passengers}
    </div>
  ` : '';

  // SVG representation of a high-fidelity 3D Colectivo Porteño (Cars-like Pixar sneak peek!)
  const svgHtml = `
    <svg viewBox="0 0 64 64" class="w-12 h-12 ${animation}">
      <defs>
        <linearGradient id="busGrad-${bus.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${neonColor}" />
          <stop offset="100%" stop-color="${stopColor}" />
        </linearGradient>
        <filter id="glow-${bus.id}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Undercarriage Shadow -->
      <ellipse cx="32" cy="52" rx="22" ry="4" fill="rgba(0,0,0,0.5)" />

      <!-- Neon glow undercarriage -->
      <path d="M 12 36 L 50 39" stroke="${neonColor}" stroke-width="4" stroke-linecap="round" filter="url(#glow-${bus.id})" opacity="0.8" />

      <!-- Rear/Side Panel of the Bus (Isometric projection) -->
      <path d="M 12 36 L 36 46 L 36 18 L 12 12 Z" fill="url(#busGrad-${bus.id})" opacity="0.9" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" />
      
      <!-- Front Face of the Bus -->
      <path d="M 36 46 L 50 38 L 50 14 L 36 18 Z" fill="url(#busGrad-${bus.id})" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />

      <!-- Front Windshield (glowing light blue glass) -->
      <path d="M 38 19 L 48 16 L 48 26 L 38 29 Z" fill="#E2E8F0" opacity="0.8" />
      <path d="M 39 20 L 47 18 L 47 25 L 39 27 Z" fill="#60A5FA" opacity="0.65" />
      
      <!-- Pixar Eyes Teaser for Gamification -->
      <!-- Left Eye -->
      <ellipse cx="42" cy="23" rx="2" ry="3.5" fill="#000" />
      <circle cx="41.5" cy="22" r="0.7" fill="#fff" />
      <!-- Right Eye -->
      <ellipse cx="45" cy="21.5" rx="2" ry="3.5" fill="#000" />
      <circle cx="44.5" cy="20.5" r="0.7" fill="#fff" />

      <!-- Side Windows (glowing / dark) -->
      <path d="M 14 16 L 20 18 L 20 26 L 14 24 Z" fill="#1E293B" opacity="0.85" />
      <path d="M 22 19 L 28 21 L 28 29 L 22 27 Z" fill="#1E293B" opacity="0.85" />
      <path d="M 30 22 L 34 23.5 L 34 31.5 L 30 30 Z" fill="#1E293B" opacity="0.85" />
      
      <!-- Destination indicator LED sign -->
      <path d="M 38 13.5 L 48 11.5 L 48 14.5 L 38 16.5 Z" fill="#0F172A" />
      <!-- Route Number "152" / "60" inside LED -->
      <text x="39" y="15" fill="#F59E0B" font-size="3.5" font-family="monospace" font-weight="black" transform="skewY(4) rotate(-3)">${bus.line}</text>

      <!-- Wheels (detailed rims) -->
      <!-- Rear Wheel -->
      <ellipse cx="24" cy="41" rx="4.5" ry="5.5" fill="#030712" />
      <ellipse cx="24" cy="41" rx="2" ry="2.5" fill="#4B5563" />
      <!-- Front Wheel -->
      <ellipse cx="43" cy="42.5" rx="4.5" ry="5.5" fill="#030712" />
      <ellipse cx="43" cy="42.5" rx="2" ry="2.5" fill="#4B5563" />

      <!-- Front Glowing headlight -->
      <circle cx="49" cy="32" r="2" fill="#FBBF24" filter="url(#glow-${bus.id})" />
    </svg>
  `;

  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="relative transition-all duration-300 ${scaleClass} flex flex-col items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
        <!-- Modern SVG Colectivo Sneak Peek -->
        ${svgHtml}
        <!-- Floating neon pill label -->
        <div class="absolute -top-3.5 -right-3 bg-gradient-to-r from-obsidian-light to-obsidian border border-slate-700/50 text-slate-100 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.3)] min-w-[20px] text-center tracking-wider">
          ${bus.line}
        </div>
        ${badgeHtml}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

export const createChaosIcon = (report: ChaosReport) => {
  let icon = '⚠️';
  let glowColor = 'glow-red';
  let borderColor = 'border-red-500/40';
  let textColor = 'text-red-400';
  let bgColor = 'bg-red-500/20';
  
  switch (report.type) {
    case ReportType.PICKET: 
      icon = '🛑'; 
      glowColor = 'glow-amber'; 
      borderColor = 'border-orange-500/40'; 
      textColor = 'text-orange-400';
      bgColor = 'bg-orange-500/20'; 
      break;
    case ReportType.ACCIDENT: 
      icon = '💥'; 
      glowColor = 'glow-red'; 
      borderColor = 'border-red-500/40'; 
      textColor = 'text-red-400';
      bgColor = 'bg-red-500/20'; 
      break;
    case ReportType.BROKEN: 
      icon = '🔧'; 
      glowColor = 'glow-amber'; 
      borderColor = 'border-yellow-500/40'; 
      textColor = 'text-yellow-400';
      bgColor = 'bg-yellow-500/20'; 
      break;
    case ReportType.STATION_CLOSED: 
      icon = '🚫'; 
      glowColor = 'glow-red'; 
      borderColor = 'border-red-600/40'; 
      textColor = 'text-red-500';
      bgColor = 'bg-red-600/20'; 
      break;
    case ReportType.DEVIATION: 
      icon = '↪️'; 
      glowColor = 'glow-amber'; 
      borderColor = 'border-blue-500/40'; 
      textColor = 'text-blue-400';
      bgColor = 'bg-blue-500/20'; 
      break;
  }

  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="flex flex-col items-center justify-center animate-bounce">
        <div class="w-9 h-9 rounded-xl ${bgColor} ${borderColor} ${glowColor} border flex items-center justify-center text-base shadow-lg relative">
          <div class="absolute inset-0 rounded-xl bg-current opacity-5 animate-pulse"></div>
          <span class="${textColor} font-bold z-10">${icon}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Bottom center
  });
};
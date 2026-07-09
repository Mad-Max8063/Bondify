import L from 'leaflet';
import { BusEntity, BusStatus, ChaosReport, ReportType } from '../types';
import { INK, LED, SEMANTIC } from '../config/designTokens';
import { ICON_SVG } from './iconSvg';

// El colectivo es oscuro (INK) siempre; el status se comunica con el dot
// semántico de la pill y la opacidad del vehículo, no pintando la carrocería.
export const createBusIcon = (bus: BusEntity, isSelected: boolean) => {
  let dotColor: string = SEMANTIC.ok;
  let dotAnimation = 'animate-pulse-slow';
  let vehicleOpacity = '';
  let pillBorder = 'border-white/10';

  if (bus.status === BusStatus.VERIFIED) {
    dotColor = SEMANTIC.ok;
    dotAnimation = 'animate-pulse-slow';
  } else if (bus.status === BusStatus.ESTIMATED) {
    dotColor = '#71717A';
    dotAnimation = '';
    vehicleOpacity = 'opacity-75';
  } else if (bus.status === BusStatus.TRAIL) {
    dotColor = LED[400];
    dotAnimation = '';
  } else if (bus.status === BusStatus.PROBLEM) {
    dotColor = SEMANTIC.danger;
    dotAnimation = 'animate-pulse';
  } else { // GHOST
    dotColor = '#52525B';
    dotAnimation = '';
    vehicleOpacity = 'opacity-50';
    pillBorder = 'border-white/20 border-dashed';
  }

  const scaleClass = isSelected ? 'scale-[1.35] z-10' : 'scale-100 hover:scale-110';
  const badgeHtml = bus.passengers > 0 ? `
    <div class="absolute -bottom-2 -left-1 bg-ink-900 text-zinc-100 text-2xs font-bold font-mono px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 border border-white/10 shadow-fab">
      ${ICON_SVG.users(9, LED[300])} ${bus.passengers}
    </div>
  ` : '';

  // Colectivo porteño isométrico: carrocería oscura + franja ámbar (la cucarda)
  // + cartel LED de destino con el número de línea en mono.
  const svgHtml = `
    <svg viewBox="0 0 64 64" class="w-12 h-12">
      <defs>
        <linearGradient id="busGrad-${bus.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${INK[700]}" />
          <stop offset="100%" stop-color="${INK[800]}" />
        </linearGradient>
      </defs>

      <!-- Undercarriage Shadow -->
      <ellipse cx="32" cy="52" rx="22" ry="4" fill="rgba(0,0,0,0.5)" />

      <!-- Rear/Side Panel of the Bus (Isometric projection) -->
      <path d="M 12 36 L 36 46 L 36 18 L 12 12 Z" fill="url(#busGrad-${bus.id})" opacity="0.95" stroke="rgba(255,255,255,0.12)" stroke-width="0.5" />

      <!-- Front Face of the Bus -->
      <path d="M 36 46 L 50 38 L 50 14 L 36 18 Z" fill="${INK[700]}" stroke="rgba(255,255,255,0.16)" stroke-width="0.5" />

      <!-- Franja ámbar (cucarda porteña): lateral + frente -->
      <path d="M 12 24 L 36 32 L 36 35 L 12 27 Z" fill="${LED[500]}" opacity="0.9" />
      <path d="M 36 32 L 50 26 L 50 28.6 L 36 35 Z" fill="${LED[600]}" opacity="0.9" />

      <!-- Front Windshield (vidrio sutil) -->
      <path d="M 38 19 L 48 16 L 48 26 L 38 29 Z" fill="#A1A1AA" opacity="0.35" />
      <path d="M 39 20 L 47 18 L 47 25 L 39 27 Z" fill="#60A5FA" opacity="0.22" />

      <!-- Side Windows (dark) -->
      <path d="M 14 16 L 20 18 L 20 26 L 14 24 Z" fill="${INK[950]}" opacity="0.85" />
      <path d="M 22 19 L 28 21 L 28 29 L 22 27 Z" fill="${INK[950]}" opacity="0.85" />
      <path d="M 30 22 L 34 23.5 L 34 31.5 L 30 30 Z" fill="${INK[950]}" opacity="0.85" />

      <!-- Cartel LED de destino -->
      <path d="M 38 13.5 L 48 11.5 L 48 14.5 L 38 16.5 Z" fill="${INK[950]}" />
      <text x="39" y="15" fill="${LED[400]}" font-size="3.5" font-family="'JetBrains Mono', monospace" font-weight="bold" transform="skewY(4) rotate(-3)">${bus.line}</text>

      <!-- Wheels -->
      <ellipse cx="24" cy="41" rx="4.5" ry="5.5" fill="#050507" />
      <ellipse cx="24" cy="41" rx="2" ry="2.5" fill="#52525B" />
      <ellipse cx="43" cy="42.5" rx="4.5" ry="5.5" fill="#050507" />
      <ellipse cx="43" cy="42.5" rx="2" ry="2.5" fill="#52525B" />

      <!-- Headlight ámbar (sin glow filter) -->
      <circle cx="49" cy="32" r="3" fill="${LED[300]}" opacity="0.25" />
      <circle cx="49" cy="32" r="1.8" fill="${LED[300]}" />
    </svg>
  `;

  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="relative transition-all duration-300 ${scaleClass} ${vehicleOpacity} flex flex-col items-center justify-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
        ${svgHtml}
        <!-- Pill: mini cartel LED con status dot -->
        <div class="absolute -top-3.5 -right-3 bg-ink-950 border ${pillBorder} text-led-400 text-2xs font-bold font-mono px-2 py-0.5 rounded-lg shadow-fab min-w-[20px] text-center tracking-wider flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full shrink-0 ${dotAnimation}" style="background:${dotColor}"></span>${bus.line}
        </div>
        ${badgeHtml}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

export const createChaosIcon = (report: ChaosReport) => {
  let iconHtml = ICON_SVG.triangleAlert(16, SEMANTIC.danger);
  let borderColor = 'border-danger/40';

  switch (report.type) {
    case ReportType.PICKET:
      iconHtml = ICON_SVG.trafficCone(16, LED[400]);
      borderColor = 'border-led-600/40';
      break;
    case ReportType.ACCIDENT:
      iconHtml = ICON_SVG.zap(16, SEMANTIC.danger);
      borderColor = 'border-danger/40';
      break;
    case ReportType.BROKEN:
      iconHtml = ICON_SVG.wrench(16, LED[300]);
      borderColor = 'border-led-600/30';
      break;
    case ReportType.STATION_CLOSED:
      iconHtml = ICON_SVG.ban(16, SEMANTIC.danger);
      borderColor = 'border-danger/50';
      break;
    case ReportType.DEVIATION:
      iconHtml = ICON_SVG.cornerUpRight(16, LED[400]);
      borderColor = 'border-led-600/40';
      break;
  }

  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `
      <div class="flex flex-col items-center justify-center animate-bounce">
        <div class="w-9 h-9 rounded-field bg-ink-900/90 ${borderColor} border flex items-center justify-center shadow-fab">
          ${iconHtml}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36], // Bottom center
  });
};

// Íconos lucide como SVG strings para usar dentro de L.divIcon (HTML plano).
// Path data copiado de lucide-react (licencia ISC). En JSX usá los componentes
// de lucide-react directamente; esto es SOLO para los markers de Leaflet.

const svg = (inner: string, size = 16, stroke = 'currentColor', strokeWidth = 2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICON_SVG = {
  // Piquete / corte
  trafficCone: (size?: number, color?: string) =>
    svg(
      '<path d="M9.3 6.2a4.55 4.55 0 0 0 5.4 0"/><path d="M7.9 10.7c.9.8 2.4 1.3 4.1 1.3s3.2-.5 4.1-1.3"/><path d="M13.9 3.5a1.93 1.93 0 0 0-3.8-.1l-3 10c-.1.2-.1.4-.1.6 0 1.7 2.2 3 5 3s5-1.3 5-3c0-.2 0-.4-.1-.5Z"/><path d="m7.5 12.2-4.7 2.7c-.5.3-.8.7-.8 1.1s.3.8.8 1.1l7.6 4.5c.9.5 2.1.5 3 0l7.6-4.5c.7-.3 1-.7 1-1.1s-.3-.8-.8-1.1l-4.7-2.8"/>',
      size, color
    ),
  // Accidente / choque
  zap: (size?: number, color?: string) =>
    svg(
      '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
      size, color
    ),
  // Bondi roto
  wrench: (size?: number, color?: string) =>
    svg(
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
      size, color
    ),
  // Estación cerrada
  ban: (size?: number, color?: string) =>
    svg('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>', size, color),
  // Desvío
  cornerUpRight: (size?: number, color?: string) =>
    svg('<polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>', size, color),
  // Pasajeros a bordo
  users: (size?: number, color?: string) =>
    svg(
      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      size, color, 2.5
    ),
  // Parada
  busFront: (size?: number, color?: string) =>
    svg(
      '<path d="M4 6 2 7"/><path d="M10 6h4"/><path d="m22 7-2-1"/><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M8 15h.01"/><path d="M16 15h.01"/><path d="M6 19v2"/><path d="M18 21v-2"/>',
      size, color
    ),
  // Genérico de alerta
  triangleAlert: (size?: number, color?: string) =>
    svg(
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
      size, color
    ),
} as const;

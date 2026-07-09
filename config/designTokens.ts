// Fuente única de verdad de la paleta "Ámbar LED".
// La consumen tailwind.config.ts Y los SVG/HTML strings de Leaflet
// (utils/leafletIcons.ts, utils/iconSvg.ts, MapView, UserMarker):
// nunca hardcodear estos hex en otro lado.

// Superficies oscuras (zinc tuneado, nunca #000 puro)
export const INK = {
  950: '#09090B', // base: body, mapa, fondo de modales
  900: '#101013', // raised: cards, nav, popups
  800: '#17171B', // elevated: inputs, chips, hover de cards
  700: '#1F1F24', // bordes sólidos fuertes
  600: '#2B2B31', // bordes hover
} as const;

// Acento de marca: el ámbar del cartel LED de destino de los bondis.
// Saturación contenida (58-76%), hue ~37°.
export const LED = {
  100: '#F7EBD3',
  200: '#F0D9A8',
  300: '#EAC378',
  400: '#E4AC55', // ACENTO PRIMARIO: números de línea, ETAs, estados activos
  500: '#CE9139', // fill de botón primario
  600: '#A97127', // pressed / bordes fuertes
  700: '#7E5420',
} as const;

// Semánticos: verde = activo/verificado/OK, rojo = peligro/problema,
// azul SOLO para el punto de ubicación del usuario (convención universal).
export const SEMANTIC = {
  ok: '#34D399',
  okDim: '#10B981',
  danger: '#F87171',
  dangerDim: '#DC2626',
  gps: '#60A5FA',
} as const;

export const TEXT = {
  primary: '#F4F4F5', // zinc-100
  secondary: '#A1A1AA', // zinc-400
  muted: '#71717A', // zinc-500
} as const;

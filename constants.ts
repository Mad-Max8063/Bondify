/**
 * Líneas frecuentes de la zona de cobertura inicial (CABA / GBA Norte).
 * Se usan como accesos rápidos al elegir línea (modo viajero y reportes);
 * cualquier otra línea se puede tipear a mano.
 */
export const LINEAS_BASE: Array<{ linea: string; ramales: string[] }> = [
  { linea: '152', ramales: ['Olivos', 'Centro', 'Tigre'] },
  { linea: '60', ramales: ['Tigre', 'Constitución'] },
  { linea: '130', ramales: ['Panamericana', 'Centro'] },
  { linea: '168', ramales: ['La Lucila', 'Palermo'] },
  { linea: '15', ramales: ['Villa Urquiza', 'Barracas'] }
];

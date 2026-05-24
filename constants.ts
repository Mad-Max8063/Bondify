import { BusEntity, BusStatus, GarageState, ChaosReport, ReportType } from './types';

export const INITIAL_GARAGE: GarageState = {
  level: 1,
  points: 150, // Puntos de regalo para testeo instantáneo en la demo
  busColor: 'bg-blue-500',
  accessories: ['ojitos_vida'], // Desbloqueado por defecto para ver la cara estilo Waze
  happiness: 30, // Empieza triste/cansado para mostrar la trompa caída en 2D
  lastCollaboration: Date.now()
};

// Coordenadas aproximadas zona Palermo/Belgrano (Av. Santa Fe / Cabildo)
export const MOCK_BUSES: BusEntity[] = [
  {
    id: 'b1',
    line: '152',
    status: BusStatus.VERIFIED,
    lat: -34.5828, // Plaza Italia aprox
    lng: -58.4215,
    heading: 320,
    passengers: 3,
    lastUpdate: Date.now(),
    destination: 'Olivos',
    arrivalEstimate: 4
  },
  {
    id: 'b2',
    line: '152',
    status: BusStatus.GHOST,
    lat: -34.5711, // Cerca de Estación Carranza
    lng: -58.4333,
    heading: 320,
    passengers: 0,
    lastUpdate: Date.now() - 300000,
    destination: 'Olivos',
    arrivalEstimate: 12
  },
  {
    id: 'b3',
    line: '60',
    status: BusStatus.TRAIL,
    lat: -34.5650, // Belgrano
    lng: -58.4400,
    heading: 310,
    passengers: 0,
    lastUpdate: Date.now() - 60000,
    destination: 'Tigre',
    arrivalEstimate: 8
  }
];

export const MOCK_REPORTS: ChaosReport[] = [
  {
    id: 'r1',
    type: ReportType.PICKET,
    lat: -34.5810,
    lng: -58.4200,
    timestamp: Date.now()
  }
];

export const BUS_COLORS = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500'
];

export interface AccessoryItem {
    id: string;
    name: string;
    emoji: string;
    description: string;
    cost: number;
    category: 'exterior' | 'interior' | 'arte';
    levelRequired: number;
    isMilestone?: boolean;
}

export const BONDIFY_ACCESSORIES: AccessoryItem[] = [
    { id: 'ojitos_vida', name: 'Ojitos de Parabrisas', emoji: '👀', description: '¡El adorno que le da vida a tu bondi! Desbloqueado en tu primera colaboración.', cost: 0, category: 'exterior', levelRequired: 1, isMilestone: true },
    { id: 'tazas_cromadas', name: 'Tazas Cromadas', emoji: '✨', description: 'Tazas relucientes para las llantas. ¡Mucho brillo!', cost: 50, category: 'exterior', levelRequired: 1 },
    { id: 'fileteado_basico', name: 'Fileteado Inicial', emoji: '🖌️', description: 'Líneas decorativas pintadas a mano en la trompa.', cost: 100, category: 'arte', levelRequired: 2 },
    { id: 'dados_peluche', name: 'Dados de Peluche', emoji: '🎲', description: 'Clásicos dados colgados en el retrovisor interior.', cost: 80, category: 'interior', levelRequired: 2 },
    { id: 'perro_tablero', name: 'Perro que mueve la Cabeza', emoji: '🐶', description: 'El perrito clásico que asiente en el tablero.', cost: 120, category: 'interior', levelRequired: 3 },
    { id: 'neones_chasis', name: 'Neones Bajochasis', emoji: '🔵', description: 'Luces LED azules que iluminan el asfalto de noche.', cost: 200, category: 'exterior', levelRequired: 3 },
    { id: 'fileteado_premium', name: 'Fileteado Artístico Completo', emoji: '🎨', description: 'Guardas completas con frase gauchesca pintada atrás.', cost: 300, category: 'arte', levelRequired: 4 },
    { id: 'luces_led_disco', name: 'Luces LED de Discoteca', emoji: '⚡', description: 'Interiores con luces cambiantes de color estilo nocturno.', cost: 250, category: 'interior', levelRequired: 4 }
];
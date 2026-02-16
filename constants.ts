import { BusEntity, BusStatus, GarageState, ChaosReport, ReportType } from './types';

export const INITIAL_GARAGE: GarageState = {
  level: 1,
  points: 0,
  busColor: 'bg-blue-500',
  accessories: []
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
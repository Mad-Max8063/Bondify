export enum UserMode {
  EFFICIENT = 'EFFICIENT',
  COMMUNITY = 'COMMUNITY',
  GUEST = 'GUEST' // Modo Invitado
}

export enum UserRole {
  WAITER = 'WAITER', // El Esperador
  TRAVELER = 'TRAVELER' // El Viajero
}

export enum BusStatus {
  VERIFIED = 'VERIFIED', // ✅ Real time user on board
  TRAIL = 'TRAIL',       // ⏳ Estimation based on recent drop-off
  GHOST = 'GHOST',       // 👻 Official/Schedule data
  PROBLEM = 'PROBLEM',   // ⚠️ Reported issue (Broken/Accident)
  ESTIMATED = 'ESTIMATED' // 📍 Position estimated (no users aboard)
}

export interface BusEntity {
  id: string;
  line: string; // e.g., "152", "60"
  status: BusStatus;
  lat: number;
  lng: number;
  heading: number; // Dirección en grados (0-360)
  passengers: number; // Number of verifiers
  lastUpdate: number; // Timestamp
  destination: string;
  arrivalEstimate: number | null; // Minutos; null = sin datos para estimar (se muestra "—")
  deviationReports?: number;
}

export enum ReportType {
  ACCIDENT = 'ACCIDENT',
  BROKEN = 'BROKEN',
  PICKET = 'PICKET',
  STATION_CLOSED = 'STATION_CLOSED',
  DEVIATION = 'DEVIATION'
}

export interface ChaosReport {
  id: string;
  type: ReportType;
  lat: number;
  lng: number;
  timestamp: number;
  reactions?: { [emoji: string]: number };
}

export interface Routine {
  id: string;
  line: string;
  time: string; // HH:MM
  returnTime?: string; // HH:MM (Optional return trip)
  active: boolean;
}

export interface UserProfile {
  mode: UserMode;
  role: UserRole;
  hasOnboarded: boolean;
  routines?: Routine[];
  demoMode?: boolean;
}

export interface DemoAction {
  type: 'CHAOS' | 'GHOST';
  id: number;
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[];
}

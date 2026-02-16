import { BusStop } from './types';

export const MOCK_STOPS: BusStop[] = [
    {
        id: 's1',
        name: 'Plaza Italia (152, 60)',
        lat: -34.5828,
        lng: -58.4215,
        lines: ['152', '60']
    },
    {
        id: 's2',
        name: 'Estación Carranza (152)',
        lat: -34.5711,
        lng: -58.4333,
        lines: ['152']
    },
    {
        id: 's3',
        name: 'Juramento y Cabildo (152, 60)',
        lat: -34.5620,
        lng: -58.4460,
        lines: ['152', '60']
    }
];

/**
 * Configuración de proveedores de mapas para Bondify
 * 
 * Para cambiar de proveedor, editar las variables de entorno:
 * 
 * VITE_MAP_PROVIDER = 'openstreetmap' | 'mapbox' | 'maptiler' | 'stadia' | 'thunderforest'
 * VITE_MAPBOX_TOKEN = 'tu_token_de_mapbox' (solo si usas Mapbox)
 * VITE_MAPTILER_KEY = 'tu_key_de_maptiler' (solo si usas MapTiler)
 * VITE_STADIA_KEY = 'tu_key_de_stadia' (solo si usas Stadia)
 * VITE_THUNDERFOREST_KEY = 'tu_key_de_thunderforest' (solo si usas Thunderforest)
 */

export type MapProvider = 'openstreetmap' | 'mapbox' | 'maptiler' | 'stadia' | 'thunderforest';

interface TileConfig {
    url: string;
    attribution: string;
    maxZoom: number;
    subdomains?: string[];
}

// Obtener el proveedor de mapas desde las variables de entorno
const getMapProvider = (): MapProvider => {
    const provider = import.meta.env.VITE_MAP_PROVIDER as MapProvider;
    return provider || 'openstreetmap';
};

// Configuraciones de tiles para cada proveedor
const getTileConfig = (): TileConfig => {
    const provider = getMapProvider();

    switch (provider) {
        case 'mapbox': {
            const token = import.meta.env.VITE_MAPBOX_TOKEN;
            if (!token) {
                console.warn('⚠️ VITE_MAPBOX_TOKEN no configurado, usando OpenStreetMap');
                return getOpenStreetMapConfig();
            }
            return {
                url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${token}`,
                attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
                maxZoom: 19
            };
        }

        case 'maptiler': {
            const key = import.meta.env.VITE_MAPTILER_KEY;
            if (!key) {
                console.warn('⚠️ VITE_MAPTILER_KEY no configurado, usando OpenStreetMap');
                return getOpenStreetMapConfig();
            }
            return {
                url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`,
                attribution: '© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19
            };
        }

        case 'stadia': {
            const key = import.meta.env.VITE_STADIA_KEY;
            // Stadia puede funcionar sin key para desarrollo (con límites)
            const keyParam = key ? `?api_key=${key}` : '';
            return {
                url: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png${keyParam}`,
                attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 20
            };
        }

        case 'thunderforest': {
            const key = import.meta.env.VITE_THUNDERFOREST_KEY;
            if (!key) {
                console.warn('⚠️ VITE_THUNDERFOREST_KEY no configurado, usando OpenStreetMap');
                return getOpenStreetMapConfig();
            }
            return {
                url: `https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${key}`,
                attribution: '© <a href="https://www.thunderforest.com/">Thunderforest</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 22
            };
        }

        case 'openstreetmap':
        default:
            return getOpenStreetMapConfig();
    }
};

// CartoDB Dark Matter (gratuito, CDN, dark nativo — sin filtros CSS encima)
const getOpenStreetMapConfig = (): TileConfig => ({
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd']
});

// Estilos de mapa disponibles para Mapbox
export const MAPBOX_STYLES = {
    streets: 'mapbox/streets-v12',
    outdoors: 'mapbox/outdoors-v12',
    light: 'mapbox/light-v11',
    dark: 'mapbox/dark-v11',
    satellite: 'mapbox/satellite-streets-v12',
    navigation: 'mapbox/navigation-day-v1'
};

// Exportar configuración
export const mapConfig = {
    provider: getMapProvider(),
    tiles: getTileConfig(),

    // Utilidades
    isUsingPremiumProvider: () => {
        const provider = getMapProvider();
        return ['mapbox', 'maptiler'].includes(provider);
    },

    getProviderName: () => {
        const names: Record<MapProvider, string> = {
            openstreetmap: 'OpenStreetMap',
            mapbox: 'Mapbox',
            maptiler: 'MapTiler',
            stadia: 'Stadia Maps',
            thunderforest: 'Thunderforest'
        };
        return names[getMapProvider()];
    }
};

export default mapConfig;

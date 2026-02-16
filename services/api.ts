/**
 * (c) 2026 Bondify. All rights reserved.
 * Proprietary and Confidential.
 */
import axios from 'axios';
import { BusEntity, BusStatus, ChaosReport, ReportType } from '../types';
import { fuzzCoordinates, getTripId } from '../utils/privacy';

// URL del backend - usa variable de entorno o fallback
const envUrl = import.meta.env.VITE_BACKEND_URL;
const BACKEND_URL = envUrl !== undefined ? envUrl : (process.env.VITE_BACKEND_URL || 'http://localhost:8001');

// If BACKEND_URL is empty (relative), API_BASE is just /api.
// If BACKEND_URL is http://localhost:8001, API_BASE is http://localhost:8001/api.
// We handle potential trailing slash /api issue.
const API_BASE = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`;

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Interfaz para colectivo desde el backend
 */
interface ColectivoBackend {
  _id: string;
  linea: string;
  ramal: string;
  ubicacion: {
    lat: number;
    lng: number;
  };
  rumbo: number;
  velocidad: number;
  esVerificado: boolean;
  esEstimado?: boolean; // Optional flag for estimated position
  reportes: Array<{
    tipo: string;
    texto?: string;
    gravedad?: number;
    timestamp: string;
  }>;
  ultimaActualizacion: string;
}

/**
 * Convertir colectivo del backend a BusEntity del frontend
 */
function convertirColectivoABus(colectivo: ColectivoBackend): BusEntity {
  // Determinar estado según verificación y tiempo
  let status = BusStatus.GHOST;
  const minutosDesdeActualizacion = (Date.now() - new Date(colectivo.ultimaActualizacion).getTime()) / 1000 / 60;

  // PRIORIDAD 1: Si está marcado como estimado (sin usuarios), mostrar GRIS
  if (colectivo.esEstimado) {
    status = BusStatus.ESTIMATED;
  }
  // PRIORIDAD 2: Si está verificado y es reciente, mostrar VERDE
  else if (colectivo.esVerificado && minutosDesdeActualizacion < 2) {
    status = BusStatus.VERIFIED;
  }
  // PRIORIDAD 3: Datos recientes pero no verificados
  else if (minutosDesdeActualizacion < 5) {
    status = BusStatus.TRAIL;
  }

  // Verificar si hay reportes de problemas (solo si no es estimado)
  if (status !== BusStatus.ESTIMATED) {
    const tieneProblema = colectivo.reportes.some(r =>
      ['ACCIDENTE', 'INSEGURIDAD', 'DEMORA_GRAVE'].includes(r.tipo)
    );

    if (tieneProblema) {
      status = BusStatus.PROBLEM;
    }
  }

  return {
    id: colectivo._id,
    line: `${colectivo.linea}${colectivo.ramal !== 'default' ? ` (${colectivo.ramal})` : ''}`,
    status,
    lat: colectivo.ubicacion.lat,
    lng: colectivo.ubicacion.lng,
    heading: colectivo.rumbo || 0,
    passengers: colectivo.esVerificado ? 1 : 0,
    lastUpdate: new Date(colectivo.ultimaActualizacion).getTime(),
    destination: colectivo.ramal !== 'default' ? colectivo.ramal : 'Centro',
    arrivalEstimate: Math.round(Math.random() * 15) + 1, // Estimación placeholder
    deviationReports: colectivo.reportes.length
  };
}

/**
 * API de Colectivos
 */
export const colectivosAPI = {
  /**
   * Obtener todos los colectivos activos
   */
  async obtenerActivos(): Promise<BusEntity[]> {
    try {
      const response = await apiClient.get('/bondi/activos');

      if (response.data.status === 'ok' && response.data.colectivos) {
        return response.data.colectivos.map(convertirColectivoABus);
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo colectivos activos:', error);
      return [];
    }
  },

  /**
   * Buscar colectivos por línea
   */
  async buscarPorLinea(linea: string): Promise<BusEntity[]> {
    try {
      const response = await apiClient.get(`/bondi/linea/${linea}`);

      if (response.data.status === 'ok' && response.data.colectivos) {
        return response.data.colectivos.map(convertirColectivoABus);
      }

      return [];
    } catch (error) {
      console.error(`Error buscando línea ${linea}:`, error);
      return [];
    }
  },

  /**
   * Enviar ping de ubicación (para viajeros)
   */
  async enviarPing(data: {
    linea: string;
    ramal?: string;
    lat: number;
    lng: number;
    velocidad?: number;
    rumbo?: number;
  }): Promise<boolean> {
    try {
      // Aplicar fuzzing antes de enviar al servidor para proteger ubicación exacta
      const fuzzed = fuzzCoordinates(data.lat, data.lng);
      const tripId = getTripId();

      const payload = {
        ...data,
        lat: fuzzed.lat,
        lng: fuzzed.lng,
        userId: tripId // Usar ID de viaje rotativo en vez de ID de usuario persistente
      };

      const response = await apiClient.post('/bondi/ping', payload);
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error enviando ping:', error);
      return false;
    }
  },

  /**
   * Enviar reporte con análisis de IA
   */
  async enviarReporte(data: {
    texto: string;
    linea: string;
    lat?: number;
    lng?: number;
  }): Promise<{
    success: boolean;
    analisis?: any;
    consejo?: string;
  }> {
    try {
      const response = await apiClient.post('/bondi/reportar', data);

      if (response.data.status === 'ok') {
        return {
          success: true,
          analisis: response.data.analisis,
          consejo: response.data.consejo
        };
      }

      return { success: false };
    } catch (error) {
      console.error('Error enviando reporte:', error);
      return { success: false };
    }
  },

  /**
   * Obtener reportes de una línea
   */
  async obtenerReportes(linea: string): Promise<any[]> {
    try {
      // Endpoint en reportesRoutes es /linea/:linea, montado en /api/reportes
      const response = await apiClient.get(`/reportes/linea/${linea}`);

      if (response.data.status === 'ok') {
        return response.data.reportes || [];
      }

      return [];
    } catch (error) {
      console.error(`Error obteniendo reportes de línea ${linea}:`, error);
      return [];
    }
  }
};

/**
 * Health check del backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.warn('Backend no disponible');
    return false;
  }
}

/**
 * API de Usuarios
 */
export const usuariosAPI = {
  /**
   * Obtener o crear perfil de usuario
   */
  async obtenerPerfil(userId: string, nombre?: string, modo?: string): Promise<any> {
    try {
      const response = await apiClient.post('/usuario/perfil', {
        userId,
        nombre,
        modo
      });

      if (response.data.status === 'ok') {
        return response.data.usuario;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  },

  /**
   * Agregar línea a favoritos
   */
  async agregarFavorito(userId: string, linea: string, ramal?: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/usuario/favoritos/agregar', {
        userId,
        linea,
        ramal
      });

      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error agregando favorito:', error);
      return false;
    }
  },

  /**
   * Eliminar de favoritos
   */
  async eliminarFavorito(userId: string, linea: string, ramal?: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/usuario/favoritos/eliminar', {
        userId,
        linea,
        ramal
      });

      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      return false;
    }
  },

  /**
   * Guardar rutina
   */
  async guardarRutina(userId: string, rutina: any): Promise<boolean> {
    try {
      const response = await apiClient.post('/usuario/rutinas/guardar', {
        userId,
        rutina
      });

      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error guardando rutina:', error);
      return false;
    }
  },

  /**
   * Registrar viaje en historial
   */
  async registrarViaje(userId: string, viaje: any): Promise<boolean> {
    try {
      const response = await apiClient.post('/usuario/historial/agregar', {
        userId,
        viaje
      });

      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error registrando viaje:', error);
      return false;
    }
  },

  /**
   * Actualizar garage/gamificación
   */
  async actualizarGarage(userId: string, datos: {
    puntos?: number;
    colorBondi?: string;
    accesorio?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/usuario/garage/actualizar', {
        userId,
        ...datos
      });

      if (response.data.status === 'ok') {
        return response.data.garage;
      }

      return null;
    } catch (error) {
      console.error('Error actualizando garage:', error);
      return null;
    }
  },

  /**
   * Obtener estadísticas del usuario
   */
  async obtenerEstadisticas(userId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/usuario/estadisticas/${userId}`);

      if (response.data.status === 'ok') {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }
};

/**
 * API de Reportes Comunitarios (estilo Waze)
 */
export const reportesAPI = {
  /**
   * Crear reporte comunitario
   */
  async crear(datos: {
    userId: string;
    tipo: string;
    linea: string;
    ramal?: string;
    lat: number;
    lng: number;
    comentario?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/reportes/crear', datos);
      return response.data;
    } catch (error) {
      console.error('Error creando reporte:', error);
      return null;
    }
  },

  /**
   * Obtener reportes cercanos
   */
  async cercanos(lat: number, lng: number, radio: number = 5000): Promise<any[]> {
    try {
      const response = await apiClient.get('/reportes/cercanos', {
        params: { lat, lng, radio }
      });
      return response.data.reportes || [];
    } catch (error) {
      console.error('Error obteniendo reportes cercanos:', error);
      return [];
    }
  },

  /**
   * Validar reporte (Yo también, Ya no pasa, Gracias)
   */
  async validar(reporteId: string, userId: string, tipo: 'yo_tambien' | 'ya_no' | 'gracias' = 'yo_tambien'): Promise<any> {
    try {
      const response = await apiClient.post('/reportes/validar', {
        reporteId,
        userId,
        tipo
      });
      return response.data;
    } catch (error) {
      console.error('Error validando reporte:', error);
      return null;
    }
  },

  /**
   * Confirmar reporte (para lleno y desvío que requieren 3 confirmaciones)
   */
  async confirmar(reporteId: string, userId: string): Promise<any> {
    try {
      const response = await apiClient.post('/reportes/confirmar', {
        reporteId,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error confirmando reporte:', error);
      return null;
    }
  },

  /**
   * Obtener reportes por línea
   */
  async porLinea(linea: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/reportes/linea/${linea}`);
      return response.data.reportes || [];
    } catch (error) {
      console.error('Error obteniendo reportes por línea:', error);
      return [];
    }
  },

  /**
   * Obtener reportes de desvío pendientes de confirmación
   * Usado para mostrar alertas a otros pasajeros del mismo colectivo
   */
  async pendientes(linea: string, userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/reportes/pendientes/${linea}`, {
        params: { userId }
      });
      return response.data.reportes || [];
    } catch (error) {
      console.error('Error obteniendo reportes pendientes:', error);
      return [];
    }
  },

  /**
   * Obtener desvíos confirmados para una línea
   * Usado para notificar a usuarios que esperan
   */
  async desviosConfirmados(linea: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/reportes/desvios-confirmados/${linea}`);
      return response.data.desvios || [];
    } catch (error) {
      console.error('Error obteniendo desvíos confirmados:', error);
      return [];
    }
  }
};

/**
 * API de Estado de Colectivos (Real vs Estimado)
 */
export const estadoColectivoAPI = {
  /**
   * Actualizar estado del colectivo (real o estimado)
   */
  async actualizarEstado(linea: string, ramal: string, esEstimado: boolean, userId: string): Promise<boolean> {
    try {
      const response = await apiClient.post('/estado/actualizar-estado', {
        linea,
        ramal,
        esEstimado,
        ultimoUsuarioId: userId
      });
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error actualizando estado:', error);
      return false;
    }
  },

  /**
   * Registrar usuario subiendo/bajando del colectivo
   */
  async registrarUsuario(linea: string, ramal: string, userId: string, accion: 'subir' | 'bajar'): Promise<any> {
    try {
      const response = await apiClient.post('/estado/registrar-usuario', {
        linea,
        ramal,
        userId,
        accion
      });
      return response.data;
    } catch (error) {
      console.error('Error registrando usuario:', error);
      return null;
    }
  },

  /**
   * Obtener estado actual del colectivo
   */
  async obtenerEstado(linea: string, ramal?: string): Promise<any> {
    try {
      const response = await apiClient.get(`/estado/estado/${linea}`, {
        params: { ramal }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado:', error);
      return null;
    }
  }
};

export default apiClient;

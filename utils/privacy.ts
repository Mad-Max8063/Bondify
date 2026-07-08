/**
 * Utilidades de privacidad para Bondify
 * 
 * Protege la identidad y ubicación de los usuarios mientras
 * permite la verificación comunitaria del transporte.
 */

// ============================================
// USER ID MANAGEMENT
// ============================================

/**
 * Genera un ID de viaje temporal (rotativo por sesión)
 * Este ID cambia cada vez que el usuario inicia un viaje
 */
export const generateTripId = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `trip_${timestamp}_${random}`;
};

/**
 * Obtiene el ID de viaje actual o genera uno nuevo
 */
export const getTripId = (): string => {
    let tripId = sessionStorage.getItem('bondify_current_trip');
    if (!tripId) {
        tripId = generateTripId();
        sessionStorage.setItem('bondify_current_trip', tripId);
    }
    return tripId;
};

/**
 * Rota el ID de viaje (llamar al terminar un viaje)
 */
export const rotateTripId = (): void => {
    sessionStorage.removeItem('bondify_current_trip');
};

/**
 * Obtiene un ID de dispositivo persistente pero anónimo
 * Solo se usa para estadísticas agregadas, nunca para tracking
 */
export const getAnonymousDeviceId = (): string => {
    let deviceId = localStorage.getItem('bondify_device_hash');
    if (!deviceId) {
        // Crear hash simple sin datos identificables
        deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('bondify_device_hash', deviceId);
    }
    return deviceId;
};

// ============================================
// COORDINATE FUZZING
// ============================================

/**
 * Aplica fuzzing a las coordenadas para proteger ubicación exacta
 * @param lat Latitud real
 * @param lng Longitud real
 * @param radiusMeters Radio de fuzzing en metros (default 50m)
 * @returns Coordenadas con fuzzing aplicado
 */
export const fuzzCoordinates = (
    lat: number,
    lng: number,
    radiusMeters: number = 50
): { lat: number; lng: number } => {
    // Convertir metros a grados (aproximado)
    // 1 grado ≈ 111km en el ecuador
    const radiusDegrees = radiusMeters / 111000;

    // Generar offset aleatorio dentro del radio
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusDegrees;

    return {
        lat: lat + (distance * Math.cos(angle)),
        lng: lng + (distance * Math.sin(angle))
    };
};

/**
 * Trunca coordenadas a una precisión menor (privacidad adicional)
 * Con 3 decimales: ~100m de precisión
 */
export const truncateCoordinates = (
    lat: number,
    lng: number,
    decimals: number = 3
): { lat: number; lng: number } => {
    const factor = Math.pow(10, decimals);
    return {
        lat: Math.floor(lat * factor) / factor,
        lng: Math.floor(lng * factor) / factor
    };
};

// ============================================
// DESTINATION PROTECTION
// ============================================

/**
 * Verifica si el usuario está cerca de un destino conocido
 * Si es así, debería dejar de compartir ubicación
 */
export const isNearDestination = (
    currentLat: number,
    currentLng: number,
    destinationLat: number,
    destinationLng: number,
    thresholdMeters: number = 200
): boolean => {
    const distance = calculateDistance(currentLat, currentLng, destinationLat, destinationLng);
    return distance <= thresholdMeters;
};

/**
 * Calcula distancia entre dos puntos en metros
 */
export const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// ============================================
// DATA MANAGEMENT
// ============================================

/**
 * Borra todos los datos locales del usuario
 */
export const deleteAllUserData = (): void => {
    // Borrar localStorage
    const keysToRemove = [
        'bondify_device_hash',
        'bondify_install_dismissed',
        'miparada_userId',
        'bondify_garage',
        'bondify_favorites',
        'bondify_routines'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Borrar sessionStorage
    sessionStorage.clear();

    console.log('[Bondify] Todos los datos del usuario eliminados');
};

/**
 * Obtiene resumen de datos almacenados (para transparencia)
 */
export const getStoredDataSummary = (): { key: string; type: string }[] => {
    const summary: { key: string; type: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('bondify') || key?.startsWith('miparada')) {
            summary.push({ key, type: 'local' });
        }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('bondify')) {
            summary.push({ key, type: 'session' });
        }
    }

    return summary;
};

// ============================================
// PANIC MODE
// ============================================

let panicModeCallback: (() => void) | null = null;

/**
 * Registra callback para modo pánico
 */
export const registerPanicCallback = (callback: () => void): void => {
    panicModeCallback = callback;
};

/**
 * Activa modo pánico - detiene todo inmediatamente
 */
export const activatePanicMode = (): void => {
    console.log('[Bondify] 🚨 MODO PÁNICO ACTIVADO');

    // Ejecutar callback registrado (detener GPS, etc.)
    if (panicModeCallback) {
        panicModeCallback();
    }

    // Borrar datos de sesión
    sessionStorage.clear();

    // Vibrar si está disponible
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
};

// ============================================
// PASSENGER COUNT PRIVACY
// ============================================

/**
 * Formatea el conteo de pasajeros de forma privada
 * NO muestra número exacto para proteger identidad
 */
export const formatPassengerCount = (count: number): string => {
    if (count === 0) return '';
    if (count === 1) return 'Usuario verificando';
    return 'Usuarios a bordo'; // Sin número específico
};

/**
 * Determina si mostrar el badge de verificación
 * (requiere al menos 1 usuario)
 */
export const shouldShowVerificationBadge = (count: number): boolean => {
    return count >= 1;
};

export default {
    generateTripId,
    getTripId,
    rotateTripId,
    getAnonymousDeviceId,
    fuzzCoordinates,
    truncateCoordinates,
    isNearDestination,
    calculateDistance,
    deleteAllUserData,
    getStoredDataSummary,
    registerPanicCallback,
    activatePanicMode,
    formatPassengerCount,
    shouldShowVerificationBadge
};

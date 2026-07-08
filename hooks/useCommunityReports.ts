import { useState, useEffect, useRef } from 'react';
import { reportesAPI, usuariosAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface DesvioNotificado {
    linea: string;
    ramal?: string;
}

interface UseCommunityReportsParams {
    userId: string;
    compartiendoUbicacion: boolean;
    lineaActual: string;
    showDesviacionAlert: boolean;
    addPoints: (amount: number) => Promise<void>;
}

// Polls: pendientes de la línea propia cada 20s (viajando),
// desvíos confirmados de las líneas favoritas cada 60s (esperando).
const PENDIENTES_INTERVAL_MS = 20000;
const DESVIOS_INTERVAL_MS = 60000;

export const useCommunityReports = ({
    userId,
    compartiendoUbicacion,
    lineaActual,
    showDesviacionAlert,
    addPoints
}: UseCommunityReportsParams) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [reportePendiente, setReportePendiente] = useState<any>(null);
    const [showConfirmarDesvio, setShowConfirmarDesvio] = useState(false);
    const [reportesYaVistos, setReportesYaVistos] = useState<string[]>([]);
    const [desvioConfirmado, setDesvioConfirmado] = useState<DesvioNotificado | null>(null);
    const [desviosNotificados, setDesviosNotificados] = useState<string[]>([]);
    // Líneas favoritas REALES del perfil del usuario (sin favoritos no se pollea nada)
    const [lineasFavoritas, setLineasFavoritas] = useState<string[]>([]);

    const stateRef = useRef({
        compartiendoUbicacion,
        lineaActual,
        userId,
        reportesYaVistos,
        showConfirmarDesvio,
        showDesviacionAlert,
        desviosNotificados,
        lineasFavoritas
    });

    useEffect(() => {
        stateRef.current = {
            compartiendoUbicacion,
            lineaActual,
            userId,
            reportesYaVistos,
            showConfirmarDesvio,
            showDesviacionAlert,
            desviosNotificados,
            lineasFavoritas
        };
    }, [
        compartiendoUbicacion,
        lineaActual,
        userId,
        reportesYaVistos,
        showConfirmarDesvio,
        showDesviacionAlert,
        desviosNotificados,
        lineasFavoritas
    ]);

    // Cargar las líneas favoritas reales del perfil
    useEffect(() => {
        const cargarFavoritas = async () => {
            try {
                const usuario = await usuariosAPI.obtenerPerfil(userId);
                const favoritas = (usuario?.favoritos || []).map((f: any) => String(f.linea));
                setLineasFavoritas([...new Set(favoritas)] as string[]);
            } catch (error) {
                console.error('Error cargando líneas favoritas:', error);
            }
        };
        cargarFavoritas();
    }, [userId]);

    // Verificar reportes pendientes de confirmación cuando estamos viajando
    useEffect(() => {
        if (!compartiendoUbicacion || !lineaActual) return;

        const verificarReportesPendientes = async () => {
            if (document.hidden) return;

            const activeLinea = stateRef.current.lineaActual;
            const activeUserId = stateRef.current.userId;
            const activeVistos = stateRef.current.reportesYaVistos;
            const activeConfirmar = stateRef.current.showConfirmarDesvio;
            const activeDesviacion = stateRef.current.showDesviacionAlert;

            if (!activeLinea) return;

            try {
                const pendientes = await reportesAPI.pendientes(activeLinea, activeUserId);

                if (pendientes.length > 0) {
                    // Filtrar reportes que ya vimos
                    const reportesNuevos = pendientes.filter(r => !activeVistos.includes(r.id));

                    if (reportesNuevos.length > 0 && !activeConfirmar && !activeDesviacion) {
                        // Mostrar el primer reporte pendiente
                        setReportePendiente(reportesNuevos[0]);
                        setShowConfirmarDesvio(true);
                    }
                }
            } catch (error) {
                console.error('Error verificando reportes pendientes:', error);
            }
        };

        verificarReportesPendientes();
        const interval = setInterval(verificarReportesPendientes, PENDIENTES_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [compartiendoUbicacion, lineaActual]);

    // Verificar desvíos confirmados para usuarios que esperan (líneas favoritas)
    useEffect(() => {
        // Solo verificar si NO estamos viajando (somos usuarios esperando)
        // y si el usuario tiene favoritas cargadas.
        if (compartiendoUbicacion || lineasFavoritas.length === 0) return;

        const verificarDesviosConfirmados = async () => {
            if (document.hidden) return;

            const activeFavoritas = stateRef.current.lineasFavoritas;
            const activeNotificados = stateRef.current.desviosNotificados;

            try {
                for (const linea of activeFavoritas) {
                    const desvios = await reportesAPI.desviosConfirmados(linea);

                    if (desvios.length > 0) {
                        // Filtrar desvíos que no hemos notificado aún
                        const nuevosDesvios = desvios.filter(d => !activeNotificados.includes(d.id));

                        if (nuevosDesvios.length > 0) {
                            const desvio = nuevosDesvios[0];
                            setDesvioConfirmado({
                                linea: desvio.linea,
                                ramal: desvio.ramal
                            });
                            setDesviosNotificados(prev => [...prev, desvio.id]);
                            break; // Solo mostrar un desvío a la vez
                        }
                    }
                }
            } catch (error) {
                console.error('Error verificando desvíos confirmados:', error);
            }
        };

        const interval = setInterval(verificarDesviosConfirmados, DESVIOS_INTERVAL_MS);
        // También verificar al montar
        verificarDesviosConfirmados();

        return () => clearInterval(interval);
    }, [compartiendoUbicacion, lineasFavoritas]);

    // Handlers para confirmar desvío de otro usuario
    const handleConfirmarDesvioOtro = async () => {
        if (!reportePendiente) return;

        const activeReporte = reportePendiente;
        setShowConfirmarDesvio(false);
        setReportesYaVistos(prev => [...prev, activeReporte.id]);

        try {
            const resultado = await reportesAPI.confirmar(activeReporte.id, userId);

            if (resultado?.estadoConfirmacion === 'confirmado') {
                showToast(t('deviation_confirmed_community'), 'success');
                await addPoints(resultado?.puntos || 5);
            } else if (resultado?.status === 'ok') {
                showToast(
                    t('deviation_confirmation_registered').replace('{n}', String(resultado?.faltanConfirmaciones ?? 0)),
                    'success'
                );
                await addPoints(resultado?.puntos || 2);
            }
        } catch (error) {
            console.error('Error confirmando desvío en el backend:', error);
        }

        setReportePendiente(null);
    };

    const handleRechazarDesvio = () => {
        if (reportePendiente) {
            setReportesYaVistos(prev => [...prev, reportePendiente.id]);
        }
        setShowConfirmarDesvio(false);
        setReportePendiente(null);
    };

    return {
        reportePendiente,
        setReportePendiente,
        showConfirmarDesvio,
        setShowConfirmarDesvio,
        reportesYaVistos,
        setReportesYaVistos,
        desvioConfirmado,
        setDesvioConfirmado,
        lineasFavoritas,
        setLineasFavoritas,
        handleConfirmarDesvioOtro,
        handleRechazarDesvio
    };
};

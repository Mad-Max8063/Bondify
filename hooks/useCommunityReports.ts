import { useState, useEffect, useRef } from 'react';
import { reportesAPI } from '../services/api';

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

export const useCommunityReports = ({
    userId,
    compartiendoUbicacion,
    lineaActual,
    showDesviacionAlert,
    addPoints
}: UseCommunityReportsParams) => {
    const [reportePendiente, setReportePendiente] = useState<any>(null);
    const [showConfirmarDesvio, setShowConfirmarDesvio] = useState(false);
    const [reportesYaVistos, setReportesYaVistos] = useState<string[]>([]);
    const [desvioConfirmado, setDesvioConfirmado] = useState<DesvioNotificado | null>(null);
    const [desviosNotificados, setDesviosNotificados] = useState<string[]>([]);
    const [lineasFavoritas, setLineasFavoritas] = useState<string[]>(['152', '60', '39']);

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

    // Verificar reportes pendientes de confirmación cuando estamos viajando
    useEffect(() => {
        if (!compartiendoUbicacion || !lineaActual) return;

        const verificarReportesPendientes = async () => {
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

        // Verificar inmediatamente y luego cada 15 segundos
        verificarReportesPendientes();
        const interval = setInterval(verificarReportesPendientes, 15000);

        return () => clearInterval(interval);
    }, [compartiendoUbicacion, lineaActual]);

    // Verificar desvíos confirmados para usuarios que esperan (líneas favoritas)
    useEffect(() => {
        // Solo verificar si NO estamos viajando (somos usuarios esperando)
        if (compartiendoUbicacion) return;

        const verificarDesviosConfirmados = async () => {
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

        // Verificar cada 30 segundos
        const interval = setInterval(verificarDesviosConfirmados, 30000);
        // También verificar al montar
        verificarDesviosConfirmados();

        return () => clearInterval(interval);
    }, [compartiendoUbicacion]);

    // Handlers para confirmar desvío de otro usuario
    const handleConfirmarDesvioOtro = async () => {
        if (!reportePendiente) return;

        const activeReporte = reportePendiente;
        setShowConfirmarDesvio(false);
        setReportesYaVistos(prev => [...prev, activeReporte.id]);

        try {
            const resultado = await reportesAPI.confirmar(activeReporte.id, userId);

            if (resultado?.estadoConfirmacion === 'confirmado') {
                alert('✅ ¡Desvío confirmado por la comunidad!\n\nLos usuarios que esperan adelante serán notificados.');
                await addPoints(5);
            } else {
                alert(`✅ Confirmación registrada.\n\nFaltan ${resultado?.faltanConfirmaciones || 0} confirmaciones más. +2 puntos`);
                await addPoints(2);
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

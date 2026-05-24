import React, { useState } from 'react';
import { AlertTriangle, Clock, Users, AlertOctagon, Navigation, X, ThumbsUp } from 'lucide-react';
import { reportesAPI } from '../services/api';

// Obtener userId del localStorage
const getUserId = () => {
  return localStorage.getItem('miparada_userId') || 'guest-user';
};

interface WazeReportButtonProps {
  onReportCreated?: () => void;
}

export const WazeReportButton: React.FC<WazeReportButtonProps> = ({ onReportCreated }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportTypes = [
    { id: 'lleno', icon: '🚌', label: 'Colectivo lleno', color: 'bg-red-500', description: 'No hay lugar' },
    { id: 'vacio', icon: '✅', label: 'Colectivo vacío', color: 'bg-green-500', description: 'Hay mucho lugar' },
    { id: 'demora', icon: '⏰', label: 'Gran demora', color: 'bg-orange-500', description: 'Mucho tráfico/espera' },
    { id: 'accidente', icon: '💥', label: 'Accidente', color: 'bg-red-600', description: 'Choque o accidente' },
    { id: 'piquete', icon: '🚧', label: 'Corte/Piquete', color: 'bg-yellow-600', description: 'Calle cortada' },
    { id: 'inseguridad', icon: '⚠️', label: 'Zona insegura', color: 'bg-purple-600', description: 'Ten precaución' },
    { id: 'fantasma', icon: '👻', label: 'Bondi fantasma', color: 'bg-gray-600', description: 'No llegó el colectivo' },
    { id: 'desvio', icon: '↪️', label: 'Desvío', color: 'bg-blue-500', description: 'Cambió de ruta' }
  ];

  const handleSubmitReport = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    
    const report = reportTypes.find(r => r.id === selectedType);
    const textoReporte = `${report?.label}: ${comentario || 'Sin comentarios'}`;

    try {
      const userId = getUserId();
      
      await reportesAPI.crear({
        userId: userId,
        tipo: selectedType,
        linea: '152', // Por ahora hardcoded, se puede mejorar
        lat: -34.5828,
        lng: -58.4215,
        comentario: comentario
      });

      // Mostrar confirmación según el tipo de reporte
      const tiposConfirmacion = ['lleno', 'desvio'];
      const requiereConfirmacion = tiposConfirmacion.includes(selectedType);
      
      if (requiereConfirmacion) {
        alert(`⏳ ¡Reporte enviado! Necesita 3 confirmaciones de otros pasajeros de la línea para hacerse público.\n\n🔒 Por seguridad, los reportes de "${report?.label}" requieren validación comunitaria.`);
      } else {
        alert(`✅ ¡Muchas gracias! Tu reporte ya está visible para todos los usuarios en el mapa en tiempo real.`);
      }
      
      setShowMenu(false);
      setSelectedType(null);
      setComentario('');
      
      if (onReportCreated) onReportCreated();
    } catch (error) {
      console.error('Error enviando reporte:', error);
      alert('❌ Error enviando reporte. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showMenu) {
    return (
      <button
        onClick={() => setShowMenu(true)}
        className="fixed top-20 right-4 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-[0_4px_20px_rgba(249,115,22,0.4)] flex items-center justify-center text-white text-2xl hover:scale-110 active:scale-95 transition-all z-[9998] animate-pulse border border-white/20"
      >
        ⚠️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-xl p-6 text-white rounded-t-3xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                ⚠️
              </div>
              <div>
                <h2 className="text-2xl font-bold">Reportar Incidente</h2>
                <p className="text-sm text-orange-100/90 font-medium">Ayudá a la comunidad en vivo</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenu(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Types */}
        {!selectedType ? (
          <div className="p-6 space-y-3">
            <p className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">¿Qué está pasando ahora?</p>
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/50 hover:bg-white/10 transition-all flex items-center gap-4 group"
              >
                <div className={`w-14 h-14 ${type.color} rounded-xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {type.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors">{type.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{type.description}</p>
                </div>
                <div className="text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">
                  →
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <button
              onClick={() => setSelectedType(null)}
              className="text-orange-400 hover:text-orange-300 flex items-center gap-2 font-semibold transition-colors"
            >
              ← Volver
            </button>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${reportTypes.find(r => r.id === selectedType)?.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg`}>
                  {reportTypes.find(r => r.id === selectedType)?.icon}
                </div>
                <div>
                  <p className="font-bold text-xl text-slate-100">{reportTypes.find(r => r.id === selectedType)?.label}</p>
                  <p className="text-sm text-slate-400">{reportTypes.find(r => r.id === selectedType)?.description}</p>
                </div>
              </div>

              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agregá detalles sobre el incidente..."
                className="w-full p-4 rounded-xl bg-obsidian-dark border border-slate-700/80 focus:border-orange-500 text-slate-100 focus:outline-none resize-none placeholder-slate-500 transition-colors"
                rows={3}
              />
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-bold text-indigo-300">Tip de la comunidad</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cuanto más específico seas, más útil será tu reporte para otros pasajeros que estén esperando la línea.
                </p>
              </div>
            </div>

            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/10 hover:brightness-110"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  Enviar Reporte
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
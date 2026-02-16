import { Navigation, Bus, X, Star } from 'lucide-react';
import { colectivosAPI } from '../services/api';
import { Routine } from '../types';

interface ActivarViajeroModalProps {
  onActivar: (linea: string, ramal: string) => void;
  onCancelar: () => void;
  routines?: Routine[];
}

export const ActivarViajeroModal: React.FC<ActivarViajeroModalProps> = ({ onActivar, onCancelar, routines = [] }) => {
  const [linea, setLinea] = useState('');
  const [ramal, setRamal] = useState('');

  // Combinar líneas comunes con líneas de las rutinas del usuario
  const routineLines = routines.map(r => ({ linea: r.line, ramales: ['Centro'], isRoutine: true }));

  // Evitar duplicados si una rutina ya está en lineasComunes
  const baseLines = [
    { linea: '152', ramales: ['Olivos', 'Centro', 'Tigre'] },
    { linea: '60', ramales: ['Tigre', 'Constitución'] },
    { linea: '130', ramales: ['Panamericana', 'Centro'] },
    { linea: '168', ramales: ['La Lucila', 'Palermo'] },
    { linea: '15', ramales: ['Villa Urquiza', 'Barracas'] }
  ];

  const lineasComunes = [...routineLines];
  baseLines.forEach(bl => {
    if (!lineasComunes.find(rl => rl.linea === bl.linea)) {
      lineasComunes.push({ ...bl, isRoutine: false });
    }
  });

  const handleActivar = () => {
    if (linea) {
      onActivar(linea, ramal || 'Centro');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Navigation className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Activar Modo Viajero</h2>
                <p className="text-sm text-green-100">Compartí tu ubicación en tiempo real</p>
              </div>
            </div>
            <button
              onClick={onCancelar}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explicación */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📍</div>
              <div>
                <p className="font-bold text-green-900 mb-1">¿Cómo funciona?</p>
                <p className="text-sm text-green-700">
                  Cuando activás el modo viajero, tu ubicación GPS se comparte automáticamente.
                  Otros usuarios podrán ver dónde está tu colectivo en tiempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Selección de línea */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              ¿En qué línea estás viajando?
            </label>

            {/* Líneas comunes - botones rápidos */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {lineasComunes.map((l) => (
                <button
                  key={l.linea}
                  onClick={() => setLinea(l.linea)}
                  className={`p-3 rounded-xl font-bold text-lg transition-all relative overflow-hidden ${linea === l.linea
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                      : l.isRoutine
                        ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  {l.linea}
                  {l.isRoutine && (
                    <div className="absolute top-0 right-0 p-1">
                      <Star className="w-2.5 h-2.5 text-green-500 fill-green-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Input manual */}
            <input
              type="text"
              value={linea}
              onChange={(e) => setLinea(e.target.value)}
              placeholder="O escribí el número de línea"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none font-medium text-lg text-center"
            />
          </div>

          {/* Selección de ramal */}
          {linea && (
            <div className="animate-in slide-in-from-top">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Ramal (opcional)
              </label>
              <select
                value={ramal}
                onChange={(e) => setRamal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none"
              >
                <option value="">Seleccioná el ramal</option>
                {lineasComunes.find(l => l.linea === linea)?.ramales.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Centro">Centro</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleActivar}
              disabled={!linea}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Comenzar a Compartir Ubicación
            </button>

            <button
              onClick={onCancelar}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Advertencia de batería */}
          <div className="text-center">
            <p className="text-xs text-slate-500">
              🔋 El GPS consume batería. Desactivá cuando bajes del colectivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

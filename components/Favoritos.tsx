import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, Bus } from 'lucide-react';
import { usuariosAPI } from '../services/api';

interface Favorito {
  linea: string;
  ramal: string;
  _id?: string;
}

interface FavoritosProps {
  userId: string;
  onClose: () => void;
}

export const Favoritos: React.FC<FavoritosProps> = ({ userId, onClose }) => {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nuevaLinea, setNuevaLinea] = useState('');
  const [nuevoRamal, setNuevoRamal] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    cargarFavoritos();
  }, [userId]);

  const cargarFavoritos = async () => {
    setIsLoading(true);
    try {
      const usuario = await usuariosAPI.obtenerPerfil(userId);
      if (usuario && usuario.favoritos) {
        setFavoritos(usuario.favoritos);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarFavorito = async () => {
    if (!nuevaLinea) return;

    const success = await usuariosAPI.agregarFavorito(userId, nuevaLinea, nuevoRamal || 'default');
    
    if (success) {
      await cargarFavoritos();
      setNuevaLinea('');
      setNuevoRamal('');
      setShowAdd(false);
    }
  };

  const eliminarFavorito = async (linea: string, ramal: string) => {
    const success = await usuariosAPI.eliminarFavorito(userId, linea, ramal);
    
    if (success) {
      setFavoritos(favoritos.filter(
        f => !(f.linea === linea && f.ramal === ramal)
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card border border-slate-700/50 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-xl p-6 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 rounded-xl shadow-inner border border-white/10">
                <Star className="w-6 h-6 text-yellow-300" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Mis Favoritos</h2>
                <p className="text-xs text-yellow-100/90 font-medium">
                  {favoritos.length} líneas guardadas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors text-slate-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
              <p className="text-slate-400 mt-4 text-sm font-semibold">Cargando favoritos...</p>
            </div>
          ) : favoritos.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-14 h-14 text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-300 text-lg font-bold">No tenés favoritos aún</p>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                Agregá tus líneas más usadas para acceder rápidamente a su recorrido y reportes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoritos.map((fav, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-[0_4px_12px_rgba(99,102,241,0.25)] border border-white/10">
                      {fav.linea}
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Línea {fav.linea}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {fav.ramal !== 'default' ? fav.ramal : 'Todos los ramales'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarFavorito(fav.linea, fav.ramal)}
                    className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors border border-red-500/10 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nuevo favorito */}
          {showAdd ? (
            <div className="bg-white/5 p-5 rounded-2xl border border-yellow-500/30 shadow-inner mt-6 space-y-4">
              <p className="font-bold text-slate-200 text-sm">Agregar Nueva Línea</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={nuevaLinea}
                  onChange={(e) => setNuevaLinea(e.target.value)}
                  placeholder="Número de línea (ej: 152)"
                  className="glass-input px-4 py-2.5 w-full text-sm placeholder-slate-500 focus:border-yellow-500/60"
                />
                <input
                  type="text"
                  value={nuevoRamal}
                  onChange={(e) => setNuevoRamal(e.target.value)}
                  placeholder="Ramal (opcional)"
                  className="glass-input px-4 py-2.5 w-full text-sm placeholder-slate-500 focus:border-yellow-500/60"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={agregarFavorito}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:brightness-110 border border-white/10 active:scale-95 transition-all"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 bg-white/10 text-slate-300 rounded-xl font-bold text-sm border border-white/5 hover:bg-white/20 active:scale-95 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.3)] border border-white/10 hover:brightness-110 active:scale-95 transition-all text-sm"
            >
              <Plus className="w-5 h-5" />
              Agregar Favorito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

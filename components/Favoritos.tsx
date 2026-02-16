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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" fill="currentColor" />
              <div>
                <h2 className="text-2xl font-bold">Mis Favoritos</h2>
                <p className="text-sm text-yellow-100">
                  {favoritos.length} líneas guardadas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mx-auto"></div>
              <p className="text-slate-500 mt-4">Cargando favoritos...</p>
            </div>
          ) : favoritos.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No tenés favoritos aún</p>
              <p className="text-slate-400 text-sm mt-2">
                Agregá tus líneas más usadas para acceso rápido
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoritos.map((fav, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                      {fav.linea}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Línea {fav.linea}</p>
                      <p className="text-sm text-slate-500">
                        {fav.ramal !== 'default' ? fav.ramal : 'Todas las ramales'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarFavorito(fav.linea, fav.ramal)}
                    className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nuevo favorito */}
          {showAdd ? (
            <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
              <p className="font-bold text-slate-900 mb-3">Agregar Nueva Línea</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={nuevaLinea}
                  onChange={(e) => setNuevaLinea(e.target.value)}
                  placeholder="Número de línea (ej: 152)"
                  className="w-full px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={nuevoRamal}
                  onChange={(e) => setNuevoRamal(e.target.value)}
                  placeholder="Ramal (opcional)"
                  className="w-full px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-yellow-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={agregarFavorito}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 rounded-lg font-bold hover:shadow-lg transition-shadow"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
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

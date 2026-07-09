import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus, X } from 'lucide-react';
import { usuariosAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';

interface Favorito {
  linea: string;
  ramal: string;
  _id?: string;
}

interface FavoritosProps {
  userId: string;
  onClose: () => void;
}

const FavoritoSkeleton: React.FC = () => (
  <div className="bg-white/5 border border-white/5 rounded-card p-4 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-ink-800 rounded-field" />
      <div className="space-y-2">
        <div className="h-3.5 w-24 bg-ink-800 rounded" />
        <div className="h-2.5 w-16 bg-ink-800 rounded" />
      </div>
    </div>
    <div className="w-10 h-10 bg-ink-800 rounded-full" />
  </div>
);

export const Favoritos: React.FC<FavoritosProps> = ({ userId, onClose }) => {
  const { language } = useLanguage();
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-overlay flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-card rounded-sheet w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-ink-900/95 backdrop-blur-xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-led-400/15 border border-led-500/20 rounded-field">
                <Star className="w-6 h-6 text-led-400" fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                  {language === 'es' ? 'Mis Favoritos' : 'My Favorites'}
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {favoritos.length} {language === 'es' ? 'líneas guardadas' : 'saved routes'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-3">
              <FavoritoSkeleton />
              <FavoritoSkeleton />
              <FavoritoSkeleton />
            </div>
          ) : favoritos.length === 0 ? (
            <div className="text-left py-8 space-y-3">
              <div className="w-12 h-12 bg-led-400/15 border border-led-500/20 rounded-card flex items-center justify-center">
                <Star className="w-6 h-6 text-led-400" />
              </div>
              <div>
                <p className="text-zinc-100 text-lg font-bold">
                  {language === 'es' ? 'No tenés favoritos aún' : 'No favorites saved yet'}
                </p>
                <p className="text-zinc-500 text-xs mt-2 leading-relaxed">
                  {language === 'es'
                    ? 'Agregá tus líneas más usadas para acceder rápidamente a su recorrido y reportes.'
                    : 'Save your most active routes to quickly check their current status and live reports.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {favoritos.map((fav, index) => (
                <div
                  key={index}
                  className="bg-white/[0.03] border border-white/5 rounded-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-ink-950 border border-white/10 rounded-field flex items-center justify-center text-led-400 font-bold font-mono text-lg">
                      {fav.linea}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200">
                        {language === 'es' ? 'Línea' : 'Line'} <span className="font-mono">{fav.linea}</span>
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                        {fav.ramal !== 'default' ? fav.ramal : (language === 'es' ? 'Todos los ramales' : 'All branches')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarFavorito(fav.linea, fav.ramal)}
                    className="w-10 h-10 rounded-full bg-danger/15 hover:bg-danger/25 text-danger flex items-center justify-center transition-colors border border-danger/10 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar nuevo favorito */}
          {showAdd ? (
            <div className="bg-white/[0.03] p-5 rounded-card border border-led-500/30 mt-6 space-y-4">
              <p className="font-bold text-zinc-200 text-sm">
                {language === 'es' ? 'Agregar Nueva Línea' : 'Add New Route'}
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={nuevaLinea}
                  onChange={(e) => setNuevaLinea(e.target.value)}
                  placeholder={language === 'es' ? 'Número de línea (ej: 152)' : 'Route number (e.g., 152)'}
                  className="glass-input px-4 py-2.5 w-full text-sm placeholder-zinc-500 font-mono"
                />
                <input
                  type="text"
                  value={nuevoRamal}
                  onChange={(e) => setNuevoRamal(e.target.value)}
                  placeholder={language === 'es' ? 'Ramal (opcional)' : 'Branch / Destination (optional)'}
                  className="glass-input px-4 py-2.5 w-full text-sm placeholder-zinc-500"
                />
                <div className="flex gap-2 pt-1">
                  <Button variant="primary" onClick={agregarFavorito} className="flex-1 text-sm">
                    {language === 'es' ? 'Agregar' : 'Add'}
                  </Button>
                  <Button variant="secondary" onClick={() => setShowAdd(false)} className="text-sm">
                    {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button variant="primary" fullWidth onClick={() => setShowAdd(true)} className="mt-6 py-3.5 text-sm">
              <Plus className="w-5 h-5" />
              {language === 'es' ? 'Agregar Favorito' : 'Add Favorite'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

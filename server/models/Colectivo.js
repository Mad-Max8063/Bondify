import mongoose from 'mongoose';

const ColectivoSchema = new mongoose.Schema({
  linea: {
    type: String,
    required: true,
    index: true // Indexado para buscar rápido (ej: "152")
  },
  ramal: {
    type: String,
    default: 'default'
  }, // Ej: "Olivos", "Boca"
  ubicacion: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  rumbo: {
    type: Number,
    default: 0
  }, // Dirección en grados (0-360) para rotar el iconito en el mapa
  velocidad: {
    type: Number,
    default: 0
  }, // Para saber si está parado o en movimiento
  esVerificado: {
    type: Boolean,
    default: true // Si viene de nuestra app, es Verificado (verde)
  },
  esEstimado: {
    type: Boolean,
    default: false // Si es true, se muestra en GRIS (sin usuarios activos)
  },
  usuariosActivos: [{
    type: String // Array de userIds compartiendo ubicación en este colectivo
  }],
  reportes: [{
    tipo: String, // "DEMORA_GRAVE", "ACCIDENTE", "INSEGURIDAD", "PIQUETE", etc.
    texto: String, // Texto original del reporte
    gravedad: Number, // 1-10
    timestamp: { type: Date, default: Date.now },
    ubicacion: {
      lat: Number,
      lng: Number
    }
  }],
  ultimaActualizacion: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index compuesto para búsquedas eficientes
ColectivoSchema.index({ linea: 1, ramal: 1 });

// TTL Index: Eliminar documentos no actualizados en 10 minutos
ColectivoSchema.index({ ultimaActualizacion: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model('Colectivo', ColectivoSchema);
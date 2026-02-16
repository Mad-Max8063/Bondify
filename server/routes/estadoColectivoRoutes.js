import express from 'express';
import Colectivo from '../models/Colectivo.js';

const router = express.Router();

/**
 * 🚌 RUTA 1: Actualizar estado del colectivo (real vs estimado)
 */
router.post('/actualizar-estado', async (req, res) => {
  const { linea, ramal, esEstimado, ultimoUsuarioId } = req.body;

  if (!linea) {
    return res.status(400).json({ error: 'Línea requerida' });
  }

  try {
    const colectivo = await Colectivo.findOneAndUpdate(
      { linea, ramal: ramal || 'default' },
      {
        esEstimado: esEstimado,
        ultimoUsuarioId: ultimoUsuarioId,
        ultimaActualizacion: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`🚌 Estado actualizado - Línea ${linea}: ${esEstimado ? 'ESTIMADO (gris)' : 'REAL (verde)'}`);

    res.json({
      status: 'ok',
      mensaje: `Colectivo marcado como ${esEstimado ? 'estimado' : 'real'}`,
      colectivo: colectivo
    });
  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({
      error: 'Error actualizando estado',
      message: error.message
    });
  }
});

/**
 * 👥 RUTA 2: Registrar usuario viajando en colectivo
 */
router.post('/registrar-usuario', async (req, res) => {
  const { linea, ramal, userId, accion } = req.body; // accion: 'subir' o 'bajar'

  if (!linea || !userId || !accion) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const colectivo = await Colectivo.findOne({
      linea,
      ramal: ramal || 'default'
    });

    if (!colectivo) {
      return res.json({
        status: 'ok',
        mensaje: 'Colectivo no encontrado',
        usuariosActivos: 0
      });
    }

    // Inicializar array si no existe
    if (!colectivo.usuariosActivos) {
      colectivo.usuariosActivos = [];
    }

    if (accion === 'subir') {
      // Agregar usuario si no está
      if (!colectivo.usuariosActivos.includes(userId)) {
        colectivo.usuariosActivos.push(userId);
      }
      // Si hay usuarios, el colectivo es REAL (no estimado)
      colectivo.esEstimado = false;
      colectivo.esVerificado = true;
    } else if (accion === 'bajar') {
      // Remover usuario
      colectivo.usuariosActivos = colectivo.usuariosActivos.filter(id => id !== userId);

      // Si no quedan usuarios, marcar como ESTIMADO
      if (colectivo.usuariosActivos.length === 0) {
        colectivo.esEstimado = true;
        colectivo.esVerificado = false;
        console.log(`👻 Colectivo ${linea} ahora es ESTIMADO (sin usuarios)`);
      }
    }

    colectivo.ultimaActualizacion = new Date();
    await colectivo.save();

    res.json({
      status: 'ok',
      mensaje: `Usuario ${accion === 'subir' ? 'subió' : 'bajó'}`,
      usuariosActivos: colectivo.usuariosActivos.length,
      esEstimado: colectivo.esEstimado
    });
  } catch (error) {
    console.error('❌ Error registrando usuario:', error);
    res.status(500).json({
      error: 'Error registrando usuario',
      message: error.message
    });
  }
});

/**
 * 📊 RUTA 3: Obtener estado de colectivo
 */
router.get('/estado/:linea', async (req, res) => {
  const { linea } = req.params;
  const { ramal } = req.query;

  try {
    const colectivo = await Colectivo.findOne({
      linea,
      ramal: ramal || 'default'
    });

    if (!colectivo) {
      return res.json({
        status: 'ok',
        esEstimado: true,
        usuariosActivos: 0,
        mensaje: 'Colectivo no encontrado'
      });
    }

    res.json({
      status: 'ok',
      esEstimado: colectivo.esEstimado || false,
      usuariosActivos: colectivo.usuariosActivos?.length || 0,
      ultimaActualizacion: colectivo.ultimaActualizacion
    });
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      error: 'Error obteniendo estado',
      message: error.message
    });
  }
});

export default router;
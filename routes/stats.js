const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

/**
 * Obtener resumen de estadísticas
 * GET /api/stats/summary
 */
router.get('/summary', async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const pendiente = await Application.countDocuments({ estado: 'pendiente' });
    const aceptado = await Application.countDocuments({ estado: 'aceptado' });
    const rechazado = await Application.countDocuments({ estado: 'rechazado' });

    res.json({
      success: true,
      data: {
        total,
        pendiente,
        aceptado,
        rechazado,
        porcentajeAceptacion: total > 0 ? ((aceptado / total) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

/**
 * Obtener estadísticas por experiencia
 * GET /api/stats/experience
 */
router.get('/experience', async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$experiencia',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
});

/**
 * Obtener tendencias diarias
 * GET /api/stats/daily
 */
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const dailyStats = await Application.aggregate([
      {
        $match: {
          fecha_solicitud: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$fecha_solicitud' }
          },
          count: { $sum: 1 },
          aceptados: {
            $sum: { $cond: [{ $eq: ['$estado', 'aceptado'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas diarias'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

/**
 * Rutas públicas
 */

// Crear nueva aplicación
router.post('/', applicationController.createApplication);

/**
 * Rutas protegidas (requieren autenticación de admin)
 * TODO: Agregar middleware de autenticación
 */

// Obtener todas las aplicaciones con filtros
router.get('/', applicationController.getAllApplications);

// Obtener estadísticas
router.get('/stats/overview', applicationController.getStats);

// Obtener una aplicación específica
router.get('/:id', applicationController.getApplicationById);

// Actualizar estado de aplicación
router.put('/:id/status', applicationController.updateApplicationStatus);

// Eliminar una aplicación
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;

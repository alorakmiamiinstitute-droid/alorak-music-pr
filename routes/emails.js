const express = require('express');
const router = express.Router();
const emailService = require('../utils/emailService');

/**
 * Verificar conexión de email
 * GET /api/emails/health
 */
router.get('/health', async (req, res) => {
  try {
    const isConnected = await emailService.verificarConexion();
    
    res.json({
      success: isConnected,
      message: isConnected ? 'Servicio de email operativo' : 'Error en servicio de email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando servicio de email'
    });
  }
});

/**
 * Reenviar email de confirmación
 * POST /api/emails/resend/:applicationId
 */
router.post('/resend/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const Application = require('../models/Application');
    
    const application = await Application.findById(applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicación no encontrada'
      });
    }

    const result = await emailService.enviarConfirmacionAplicacion(application);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email reenviado exitosamente',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error al reenviar email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error rereenviando email:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando solicitud'
    });
  }
});

module.exports = router;

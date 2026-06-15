const Application = require('../models/Application');
const emailService = require('../utils/emailService');
const { validateApplication, validateStatusUpdate, sanitizeApplicationData, detectPotentialDuplicate } = require('../utils/validators');

/**
 * Crear nueva solicitud de aplicación
 * POST /api/applications
 */
const createApplication = async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Validar datos de entrada
    const { error, value } = validateApplication(req.body);
    
    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path[0]] = detail.message;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Error en la validación de datos',
        errors
      });
    }

    // Detectar duplicados y spam
    const duplicateCheck = await detectPotentialDuplicate(value.email, clientIp);
    
    if (duplicateCheck.isDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una solicitud de este email. Por favor, espera 24 horas antes de volver a aplicar.',
        lastApplication: duplicateCheck.lastApplication._id
      });
    }

    if (duplicateCheck.isPotentialSpam) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes desde esta dirección. Por favor, intenta más tarde.'
      });
    }

    // Sanitizar datos
    const sanitizedData = sanitizeApplicationData(value);

    // Crear nueva aplicación
    const newApplication = new Application({
      ...sanitizedData,
      ip_address: clientIp,
      user_agent: userAgent
    });

    // Guardar en base de datos
    const savedApplication = await newApplication.save();

    // Enviar email de confirmación al solicitante
    await emailService.enviarConfirmacionAplicacion(savedApplication);

    // Notificar a administradores
    await emailService.notificarNuevaAplicacion(savedApplication);

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: '¡Solicitud recibida exitosamente!',
      application: {
        id: savedApplication._id,
        nombre: savedApplication.nombre,
        email: savedApplication.email,
        estado: savedApplication.estado,
        fecha_solicitud: savedApplication.fecha_solicitud
      }
    });

  } catch (error) {
    console.error('❌ Error en createApplication:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener todas las aplicaciones (Admin)
 * GET /api/applications
 */
const getAllApplications = async (req, res) => {
  try {
    const { estado, skip = 0, limit = 20, sort = '-fecha_solicitud' } = req.query;

    const filter = {};
    if (estado) {
      filter.estado = estado;
    }

    const applications = await Application.find(filter)
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .select('-ip_address -user_agent -token_confirmacion');

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error en getAllApplications:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener las aplicaciones'
    });
  }
};

/**
 * Obtener una aplicación específica
 * GET /api/applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .select('-ip_address -user_agent -token_confirmacion');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicación no encontrada'
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('❌ Error en getApplicationById:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener la aplicación'
    });
  }
};

/**
 * Actualizar estado de aplicación (Admin)
 * PUT /api/applications/:id/status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = validateStatusUpdate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Error en la validación',
        errors: error.details
      });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicación no encontrada'
      });
    }

    // Actualizar estado
    application.estado = value.estado;
    if (value.notas_admin) {
      application.notas_admin = value.notas_admin;
    }
    application.fecha_revision = new Date();

    const updatedApplication = await application.save();

    // Enviar notificación por email
    if (value.estado !== 'pendiente') {
      await emailService.enviarNotificacionEstado(
        updatedApplication,
        value.estado,
        value.notas_admin
      );
    }

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      application: updatedApplication.toPublicJSON()
    });

  } catch (error) {
    console.error('❌ Error en updateApplicationStatus:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado'
    });
  }
};

/**
 * Eliminar una aplicación (Admin)
 * DELETE /api/applications/:id
 */
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplicación no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Aplicación eliminada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en deleteApplication:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la aplicación'
    });
  }
};

/**
 * Obtener estadísticas generales
 * GET /api/applications/stats/overview
 */
const getStats = async (req, res) => {
  try {
    const total = await Application.countDocuments();
    const pendiente = await Application.countDocuments({ estado: 'pendiente' });
    const revisado = await Application.countDocuments({ estado: 'revisado' });
    const aceptado = await Application.countDocuments({ estado: 'aceptado' });
    const rechazado = await Application.countDocuments({ estado: 'rechazado' });
    const confirmados = await Application.countDocuments({ email_confirmado: true });

    // Aplicaciones del último mes
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthCount = await Application.countDocuments({
      fecha_solicitud: { $gte: lastMonth }
    });

    // Especialización más popular
    const especializations = await Application.aggregate([
      { $unwind: '$especializacion' },
      { $group: { _id: '$especializacion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        resumen: {
          total,
          pendiente,
          revisado,
          aceptado,
          rechazado,
          confirmados,
          ultimoMes: lastMonthCount
        },
        especializacionesPoblares: especializations.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('❌ Error en getStats:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getStats
};

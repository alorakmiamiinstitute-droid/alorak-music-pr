const Joi = require('joi');

/**
 * Validador centralizado para formularios de aplicación
 */
const applicationValidationSchema = Joi.object({
  nombre: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres'
    }),
  
  email: Joi.string()
    .required()
    .email()
    .lowercase()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'El email debe ser válido'
    }),
  
  fecha_nacimiento: Joi.date()
    .required()
    .custom((value, helpers) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        return helpers.error('age.invalid');
      }
      if (age > 120) {
        return helpers.error('age.invalid');
      }
      return value;
    })
    .messages({
      'date.base': 'La fecha de nacimiento debe ser una fecha válida',
      'date.required': 'La fecha de nacimiento es requerida',
      'age.invalid': 'Debes ser mayor de 18 años para aplicar'
    }),
  
  residencia: Joi.string()
    .required()
    .valid('SI', 'NO')
    .custom((value, helpers) => {
      if (value !== 'SI') {
        return helpers.error('residencia.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'Debes seleccionar tu residencia',
      'residencia.invalid': 'Esta convocatoria es exclusiva para artistas que vivan en Puerto Rico'
    }),
  
  fotos_url: Joi.string()
    .required()
    .uri()
    .custom((value, helpers) => {
      const allowedDomains = ['drive.google.com', 'dropbox.com', 'imgur.com', 'flickr.com', 'portfolio'];
      const url = new URL(value);
      
      const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));
      
      if (!isAllowed) {
        return helpers.error('url.domain');
      }
      
      return value;
    })
    .messages({
      'string.empty': 'El enlace a fotos es requerido',
      'string.uri': 'Debes proporcionar una URL válida',
      'url.domain': 'El enlace debe ser de Google Drive, Dropbox, Imgur o similar'
    }),
  
  telefono: Joi.string()
    .optional()
    .pattern(/^[\d\s\-\+\(\)]{7,}$/)
    .messages({
      'string.pattern.base': 'El teléfono no es válido'
    }),
  
  biografia: Joi.string()
    .optional()
    .max(500)
    .messages({
      'string.max': 'La biografía no puede exceder 500 caracteres'
    }),
  
  experiencia: Joi.string()
    .optional()
    .valid('Principiante', 'Intermedio', 'Avanzado', 'Profesional'),
  
  especializacion: Joi.array()
    .optional()
    .items(Joi.string().valid(
      'Actuación', 'Música', 'Modelaje', 'Danza', 'Producción', 'Dirección', 'Otro'
    )),
  
  acepta_terminos: Joi.boolean()
    .required()
    .valid(true)
    .messages({
      'boolean.base': 'Debes aceptar los términos y condiciones',
      'any.only': 'Debes aceptar los términos y condiciones'
    }),
  
  acepta_privacidad: Joi.boolean()
    .required()
    .valid(true)
    .messages({
      'boolean.base': 'Debes aceptar la política de privacidad',
      'any.only': 'Debes aceptar la política de privacidad'
    })
});

/**
 * Validador para actualización de estado (solo admin)
 */
const statusUpdateSchema = Joi.object({
  estado: Joi.string()
    .required()
    .valid('pendiente', 'revisado', 'aceptado', 'rechazado')
    .messages({
      'string.empty': 'El estado es requerido',
      'any.only': 'Estado inválido'
    }),
  
  notas_admin: Joi.string()
    .optional()
    .max(1000)
    .messages({
      'string.max': 'Las notas no pueden exceder 1000 caracteres'
    })
});

/**
 * Función para validar aplicación
 */
const validateApplication = (data) => {
  const { error, value } = applicationValidationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  
  return { error, value };
};

/**
 * Función para validar actualización de estado
 */
const validateStatusUpdate = (data) => {
  const { error, value } = statusUpdateSchema.validate(data, {
    abortEarly: false
  });
  
  return { error, value };
};

/**
 * Función para sanitizar entrada de datos
 */
const sanitizeApplicationData = (data) => {
  return {
    nombre: data.nombre?.trim().replace(/[<>]/g, '') || '',
    email: data.email?.toLowerCase().trim() || '',
    fecha_nacimiento: new Date(data.fecha_nacimiento),
    residencia: data.residencia?.toUpperCase() || '',
    fotos_url: data.fotos_url?.trim() || '',
    telefono: data.telefono?.replace(/[^\d\s\-\+\(\)]/g, '') || '',
    biografia: data.biografia?.trim().replace(/[<>]/g, '') || '',
    experiencia: data.experiencia || 'Principiante',
    especializacion: Array.isArray(data.especializacion) ? data.especializacion : [],
    acepta_terminos: Boolean(data.acepta_terminos),
    acepta_privacidad: Boolean(data.acepta_privacidad)
  };
};

/**
 * Función para detectar duplicados/spam
 */
const detectPotentialDuplicate = async (email, ipAddress) => {
  const Application = require('../models/Application');
  
  // Verificar mismo email en últimas 24 horas
  const sameEmailRecently = await Application.findOne({
    email: email,
    fecha_solicitud: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });
  
  // Verificar misma IP en últimas 2 horas (múltiples aplicaciones)
  const sameIpRecently = await Application.countDocuments({
    ip_address: ipAddress,
    fecha_solicitud: {
      $gte: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  });
  
  return {
    isDuplicate: !!sameEmailRecently,
    isPotentialSpam: sameIpRecently > 5,
    lastApplication: sameEmailRecently
  };
};

module.exports = {
  applicationValidationSchema,
  statusUpdateSchema,
  validateApplication,
  validateStatusUpdate,
  sanitizeApplicationData,
  detectPotentialDuplicate
};

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar transportador de email
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.fromEmail = process.env.EMAIL_FROM || 'noreply@alorakmusicpr.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Agencia de Talentos PR';
  }

  /**
   * Verificar conexión de email
   */
  async verificarConexion() {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión de email verificada');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión de email:', error);
      return false;
    }
  }

  /**
   * Enviar email de confirmación de aplicación
   */
  async enviarConfirmacionAplicacion(applicant) {
    const { nombre, email, fecha_solicitud } = applicant;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .content h2 {
            color: #8b5cf6;
            margin-top: 0;
          }
          .content p {
            line-height: 1.6;
            margin: 15px 0;
          }
          .details {
            background-color: #f9f9f9;
            border-left: 4px solid #8b5cf6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .details p {
            margin: 8px 0;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .button {
            display: inline-block;
            background-color: #8b5cf6;
            color: white;
            padding: 12px 30px;
            border-radius: 6px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background-color: #7c3aed;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Agencia de Talentos PR</h1>
            <p>¡Gracias por tu interés!</p>
          </div>
          
          <div class="content">
            <h2>¡Hola ${nombre}!</h2>
            
            <p>Hemos recibido tu solicitud de forma exitosa. Tu aplicación ha sido registrada en nuestro sistema y está siendo procesada.</p>
            
            <div class="details">
              <p><strong>Número de Solicitud:</strong> ${applicant._id}</p>
              <p><strong>Fecha de Solicitud:</strong> ${new Date(fecha_solicitud).toLocaleDateString('es-PR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Estado:</strong> <span style="color: #8b5cf6; font-weight: bold;">Pendiente de Revisión</span></p>
            </div>
            
            <h3>Próximos Pasos:</h3>
            <ul>
              <li>Nuestro equipo revisará tu solicitud dentro de 5-7 días hábiles</li>
              <li>Te notificaremos por email sobre el resultado de la evaluación</li>
              <li>Mantén tu email actualizado para no perder comunicaciones importantes</li>
              <li>Si tienes dudas, contáctanos a: info@alorakmusicpr.com</li>
            </ul>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Esta es una comunicación automática. Por favor no responda a este correo.
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Agencia de Talentos PR. Todos los derechos reservados.</p>
            <p>Puerto Rico | www.alorakmusicpr.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: '🎉 ¡Solicitud Recibida! - Agencia de Talentos PR',
      html: htmlContent,
      text: `
Hola ${nombre},

¡Gracias por tu interés en formar parte de la Agencia de Talentos PR!

Hemos recibido tu solicitud exitosamente. Tu aplicación está siendo procesada.

Número de Solicitud: ${applicant._id}
Fecha: ${new Date(fecha_solicitud).toLocaleDateString('es-PR')}

Próximos pasos:
- Revisaremos tu solicitud en 5-7 días hábiles
- Te notificaremos por email con los resultados
- Mantén tu email actualizado

¡Gracias por tu interés!

Agencia de Talentos PR
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de cambio de estado
   */
  async enviarNotificacionEstado(applicant, nuevoEstado, mensaje = '') {
    const { nombre, email } = applicant;
    
    const estadoMessages = {
      aceptado: {
        titulo: '🎉 ¡Felicidades! Tu solicitud ha sido ACEPTADA',
        color: '#22c55e',
        icon: '✅'
      },
      rechazado: {
        titulo: '⚠️ Actualización en tu solicitud',
        color: '#ef4444',
        icon: '❌'
      },
      revisado: {
        titulo: '📋 Tu solicitud está siendo revisada',
        color: '#f59e0b',
        icon: '👀'
      }
    };

    const estadoInfo = estadoMessages[nuevoEstado] || estadoMessages.revisado;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, ${estadoInfo.color} 0%, ${estadoInfo.color}dd 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${estadoInfo.icon} ${estadoInfo.titulo}</h1>
          </div>
          
          <div class="content">
            <p>Hola ${nombre},</p>
            
            <p>Tu solicitud ha sido ${nuevoEstado === 'aceptado' ? 'aceptada' : 'revisada'} por nuestro equipo.</p>
            
            ${mensaje ? `<p><strong>Mensaje del equipo:</strong></p><p>${mensaje}</p>` : ''}
            
            <p>Si tienes cualquier pregunta, no dudes en contactarnos.</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Agencia de Talentos PR | info@alorakmusicpr.com
            </p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Agencia de Talentos PR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: email,
      subject: estadoInfo.titulo,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de notificación enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email de notificación:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email a administradores notificando nueva aplicación
   */
  async notificarNuevaAplicacion(applicant) {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (adminEmails.length === 0) {
      console.warn('⚠️ No hay emails de admin configurados');
      return;
    }

    const htmlContent = `
      <h2>Nueva Aplicación Recibida</h2>
      <p><strong>Nombre:</strong> ${applicant.nombre}</p>
      <p><strong>Email:</strong> ${applicant.email}</p>
      <p><strong>Teléfono:</strong> ${applicant.telefono || 'No proporcionado'}</p>
      <p><strong>Experiencia:</strong> ${applicant.experiencia}</p>
      <p><strong>Especialización:</strong> ${applicant.especializacion?.join(', ') || 'No especificada'}</p>
      <p><strong>Fotos:</strong> <a href="${applicant.fotos_url}">Ver fotos</a></p>
      <p><a href="${process.env.SERVER_URL || 'http://localhost:5000'}/api/applications/${applicant._id}">Ver aplicación completa</a></p>
    `;

    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: adminEmails.join(','),
      subject: `🆕 Nueva Aplicación: ${applicant.nombre}`,
      html: htmlContent
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de admin enviado:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error enviando email a admin:', error);
      return { success: false };
    }
  }

  /**
   * Enviar email con reporte
   */
  async enviarReporte(destinatario, asunto, html) {
    const mailOptions = {
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: destinatario,
      subject: asunto,
      html: html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();

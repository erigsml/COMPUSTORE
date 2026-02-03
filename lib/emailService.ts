import nodemailer from 'nodemailer';

// Configuración del transportador de Nodemailer
// Para Siteground, usa localhost como host SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '25'),
    secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    } : undefined,
    tls: {
        rejectUnauthorized: false
    }
});

// Función para enviar un correo
export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || `noreply@${process.env.DOMAIN}`,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', info.response);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error;
    }
};
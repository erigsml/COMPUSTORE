import { sendEmail } from '@/lib/emailService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { name, email, phone, message } = await request.json();

        // Validar datos
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Preparar el contenido del email
        const emailContent = `
Nuevo mensaje de contacto desde COMPUSTORE

Nombre: ${name}
Email: ${email}
Teléfono: ${phone || 'No proporcionado'}

Mensaje:
${message}

---
Este correo fue enviado desde el formulario de contacto del sitio web.
        `;

        // Enviar email al administrador
        await sendEmail(
            process.env.SMTP_USER || email,
            `Nuevo mensaje de contacto - ${name}`,
            emailContent
        );

        // Enviar confirmación al cliente
        const confirmationEmail = `
Hola ${name},

Gracias por contactarnos. Hemos recibido tu mensaje y nos pondremos en contacto contigo a la brevedad.

Tu mensaje:
${message}

---
Equipo COMPUSTORE
        `;

        await sendEmail(
            email,
            'Confirmación de tu mensaje - COMPUSTORE',
            confirmationEmail
        );

        return NextResponse.json(
            { success: true, message: 'Mensaje enviado correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error al procesar el contacto:', error);
        return NextResponse.json(
            { error: 'Error al enviar el mensaje' },
            { status: 500 }
        );
    }
}

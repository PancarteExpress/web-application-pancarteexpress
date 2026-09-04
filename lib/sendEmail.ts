import nodemailer from 'nodemailer';
//import { Resend } from 'resend';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

type EmailResponse = {
  success: boolean;
  error?: string;
  id?: string;
};

async function sendEmailDev(payload: EmailPayload): Promise<EmailResponse> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    console.log('✅ Email envoyé (dev):', result.messageId);
    return { success: true, id: result.messageId };
  } catch (error) {
    console.error('❌ Erreur email (dev):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/*async function sendEmailProd(payload: EmailPayload): Promise<EmailResponse> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (result.error) {
      console.error('❌ Erreur email (prod):', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('✅ Email envoyé (prod):', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('❌ Erreur email (prod):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}*/

export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  /*if (process.env.NODE_ENV === 'production') {
    return sendEmailProd(payload);
  } else {*/
    return sendEmailDev(payload);
  //}
}
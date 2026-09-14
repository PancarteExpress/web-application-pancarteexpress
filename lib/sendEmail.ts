import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

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


export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    if (result.error) {
      console.error('❌ Erreur email:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('✅ Email envoyé:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('❌ Erreur email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
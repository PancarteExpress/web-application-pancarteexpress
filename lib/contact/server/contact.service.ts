import { sendEmail } from '@/lib/sendEmail';

/**
 * Envoyer email de contact (avec email au client et admin)
 */
export async function sendContactEmail(
  email: string,
  clientEmailHTML: string,
  adminEmailHTML?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !clientEmailHTML) {
      return {
        success: false,
        error: 'Email et clientEmailHTML requis',
      };
    }

    // Envoyer au client
    const clientResult = await sendEmail({
      to: email,
      subject: 'Confirmation de votre demande de contact',
      html: clientEmailHTML,
    });

    if (!clientResult.success) {
      return {
        success: false,
        error: 'Erreur envoi email client',
      };
    }

    // Attendre un peu avant d'envoyer à l'admin
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Envoyer à l'admin si fourni
    if (adminEmailHTML) {
      await sendEmail({
        to: process.env.EMAIL_FROM || '',
        subject: 'Nouvelle demande de contact',
        html: adminEmailHTML,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[sendContactEmail]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
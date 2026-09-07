import { sendEmail } from './sendEmail';

type CheckoutEmailData = {
  email: string;
  orderId: string;
  clientEmailHTML: string;
  adminEmailHTML?: string;
};

export async function sendCheckoutEmail(data: CheckoutEmailData) {
  try {
    const { email, orderId, clientEmailHTML, adminEmailHTML } = data;

    if (!email || !orderId || !clientEmailHTML) {
      return {
        success: false,
        error: 'Email, orderId et clientEmailHTML requis',
      };
    }

    // Envoyer au client
    const clientResult = await sendEmail({
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: clientEmailHTML,
    });

    if (!clientResult.success) {
      return {
        success: false,
        error: 'Erreur envoi email client',
      };
    }

    // Envoyer à l'admin si fourni
    if (adminEmailHTML) {
      await sendEmail({
        to: process.env.EMAIL_FROM!,
        subject: `Nouvelle commande #${orderId}`,
        html: adminEmailHTML,
      });
    }

    return {
      success: true,
      message: 'Emails envoyés',
    };
  } catch (error) {
    console.error('Erreur sendCheckoutEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
import { sendEmail } from '@/lib/sendEmail';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();
    const { email, clientEmailHTML, adminEmailHTML } = body;

    if (!email || !clientEmailHTML) {
      return NextResponse.json(
        { error: 'Email et clientEmailHTML requis' },
        { status: 400 }
      );
    }

    // Envoyer au client
    const clientResult = await sendEmail({
      to: email,
      subject: 'Confirmation de votre demande de contact',
      html: clientEmailHTML,
    });

    if (!clientResult.success) {
      return NextResponse.json(
        { error: 'Erreur envoi email client' },
        { status: 500 }
      );
    }

    // Attendre 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Envoyer à l'admin
    if (adminEmailHTML) {
      await sendEmail({
        to: process.env.EMAIL_FROM!,
        subject: 'Nouvelle demande de contact',
        html: adminEmailHTML,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur send-email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
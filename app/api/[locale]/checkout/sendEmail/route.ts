import { sendEmail } from '@/lib/sendEmail';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();
    const { email, orderId, clientEmailHTML, adminEmailHTML } = body;

    if (!email || !orderId || !clientEmailHTML) {
      return NextResponse.json(
        { error: 'Email, orderId et clientEmailHTML requis' },
        { status: 400 }
      );
    }

    // Envoyer au client
    const clientResult = await sendEmail({
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: clientEmailHTML,
    });

    if (!clientResult.success) {
      return NextResponse.json(
        { error: 'Erreur envoi email client' },
        { status: 500 }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Envoyer à l'admin si fourni
    if (adminEmailHTML) {
      await sendEmail({
        to: process.env.EMAIL_FROM!,
        subject: `Nouvelle commande #${orderId}`,
        html: adminEmailHTML,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur send-email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/contact/server/contact.service';
import { sendContactEmailSchema } from '@/lib/validations/contact';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = sendContactEmailSchema.parse(body);

    // Appeler le service
    const result = await sendContactEmail(
      validatedInput.email,
      validatedInput.clientEmailHTML,
      validatedInput.adminEmailHTML
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/contact]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
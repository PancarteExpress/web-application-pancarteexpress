import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { getGroupById, canAccessGroup } from '@/lib/groups/server/group.service';
import { groupIdSchema } from '@/lib/validations/group';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; groupId: string }> }
) {
  try {
    const { groupId: groupIdStr } = await params;

    // 1. Valider groupId
    const validatedId = groupIdSchema.parse({ groupId: groupIdStr });

    // 2. Vérifier JWT
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 3. ✅ SÉCURITÉ: Vérifier que l'utilisateur a accès au groupe
    const hasAccess = await canAccessGroup(payload.userId, validatedId.groupId);

    if (!hasAccess) {
      console.warn(
        `[getGroup] Tentative accès non autorisé: ${payload.userId} sur groupe ${validatedId.groupId}`
      );
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // 4. Récupérer le groupe
    const group = await getGroupById(validatedId.groupId);

    if (!group) {
      return NextResponse.json({ error: 'Groupe non trouvé' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('[GET /api/groups/[groupId]]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
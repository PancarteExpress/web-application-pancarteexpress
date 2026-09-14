import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/shop/server/shop.service';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('[GET /api/shop/categories]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
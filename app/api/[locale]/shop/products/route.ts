import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shop/server/shop.service';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('[GET /api/shop/products]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
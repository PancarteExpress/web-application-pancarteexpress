import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name_fr: p.name_fr,
      name_en: p.name_en,
      price: p.price,
      original_price: p.original_price,
      image_url: p.image_url,
      category_id: p.categoryId,
      category_name: p.category.name,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Erreur products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
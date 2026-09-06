import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
    { id: 1, category: 'accessories', name_fr: 'Boites a cles', price: 29.99, image: "/shop/accessories/accessories1.jpg" },
    { id: 2, category: 'anchors', name_fr: 'Ancrage en metal en V', price: 26.99, image: "/shop/anchors/anchors1.jpg" },
    { id: 3, category: 'anchors', name_fr: 'Ancrage en metal pour poteaux colonial', price: 23.99, image: "/shop/anchors/anchors2.jpg" },
    { id: 4, category: 'anchors', name_fr: 'Ancrage en metal standard', price: 26.99, image: "/shop/anchors/anchors3.jpg" },
    { id: 5, category: 'anchors', name_fr: 'Ancrage pour poteaux en aluminium et poteaux Engel et Volkers', price: 34.99, image: "/shop/anchors/anchors4.jpg" },
    { id: 6, category: 'anchors', name_fr: 'Ensemble poteau blanc en plastique 35" et ancrage', price: 59.99, image: "/shop/anchors/anchors5.jpg" },
    { id: 7, category: 'anchors', name_fr: 'Ensemble poteau blanc en plastique 48" et ancrage', price: 64.99, image: "/shop/anchors/anchors6.jpg" },
    { id: 8, category: 'anchors', name_fr: 'Manchon de poteau de signalisation', price: 44.99, image: "/shop/anchors/anchors7.jpg" },
    { id: 9, category: 'anchors', name_fr: 'Tige vissable FRAMD', price: 24.99, image: "/shop/anchors/anchors8.jpg" },
    { id: 10, category: 'anchors', name_fr: 'Tige dencrage FRAMD', price: 14.99, image: "/shop/anchors/anchors9.jpg" },
    { id: 11, category: 'poles', name_fr: 'Ensemble poteau blanc en plastique 35" et ancrage', price: 59.99, image: "/shop/poles/poles1.jpg" },
    { id: 12, category: 'poles', name_fr: 'Ensemble poteau blanc en plastique 48" et ancrage', price: 64.99, image: "/shop/poles/poles2.jpg" },
    { id: 13, category: 'poles', name_fr: 'Poteau blanc en plastique 36" avec vis en nylon', price: 35.99, image: "/shop/poles/poles3.jpg" },
    { id: 14, category: 'poles', name_fr: 'Poteau blanc en plastique 48" avec vis en nylon', price: 40.99, image: "/shop/poles/poles4.jpg" },
    { id: 15, category: 'poles', name_fr: 'Poteau potence colonial avec ancrage', price: 124.99, image: "/shop/poles/poles5.jpg" },
    { id: 16, category: 'poles', name_fr: 'Poteau potence en aluminium avec ancrage', price: 154.99, image: "/shop/poles/poles6.jpg" },
    { id: 17, category: 'poles', name_fr: 'Poteau potence en aluminium Engel et Volkers avec ancrage', price: 154.99, image: "/shop/poles/poles7.jpg" },
    { id: 18, category: 'poles', name_fr: 'Poteau potence en plastique blanc avec ancrage', price: 119.99, image: "/shop/poles/poles8.jpg" },
    { id: 19, category: 'poles', name_fr: 'Poteau signalitique en U 8 pieds', price: 124.99, image: "/shop/poles/poles9.jpg" },
    { id: 20, category: 'hardware', name_fr: 'Attahce en metal << C Clip >> (pour poteaux en aluminium)', price: 0.99, image: "/shop/hardware/hardware1.jpg" },
    { id: 21, category: 'hardware', name_fr: 'Attahce en plastique (pour poteaux potence colonial)', price: 1.49, image: "/shop/hardware/hardware2.jpg" },
    { id: 22, category: 'hardware', name_fr: 'Manchon de poteau de signalisation', price: 44.99, image: "/shop/hardware/hardware3.jpg" },
    { id: 23, category: 'hardware', name_fr: 'Sachet de papillons en nylon', price: 29.99, image: "/shop/hardware/hardware4.jpg" },
    { id: 24, category: 'hardware', name_fr: 'Sachet de rondelles en nylon', price: 13.49, image: "/shop/hardware/hardware5.jpg" },
    { id: 25, category: 'hardware', name_fr: 'Sachet de vis en nylon', price: 44.99, image: "/shop/hardware/hardware6.jpg" },
    { id: 26, category: 'purchase', name_fr: 'Structure LARGE - FRAMD (flex ou rigide)', price: 1887.99, image: "/shop/purchase/purchase1.jpg" },
    { id: 27, category: 'commercial', name_fr: 'Structure MINI en V - FRAMD', price: 1334.99, image: "/shop/purchase/purchase2.jpg" },
    { id: 28, category: 'commercial', name_fr: 'Structure MINI - FRAMD (rigide)', price: 1029.99, image: "/shop/purchase/purchase3.jpg" },
    { id: 29, category: 'commercial', name_fr: 'Structure STANDARD - FRAMD', price: 1519.99, image: "/shop/purchase/purchase4.jpg" },
    { id: 30, category: 'commercial', name_fr: 'Structure STANDARD en V - FRAMD', price: 2221.99, image: "/shop/purchase/purchase5.jpg" },
    { id: 31, category: 'commercial', name_fr: 'LOCATION - LARGE - FRAMD (flex ou rigide)', price: 264.99, image: "/shop/rent/rent1.jpg" },
    { id: 32, category: 'commercial', name_fr: 'LOCATION - MINI - FRAMD (flex ou rigide)', price: 199.99, image: "/shop/rent/rent2.jpg" },
    { id: 33, category: 'commercial', name_fr: 'LOCATION - STANDARD - FRAMD (flex ou rigide)', price: 234.99, image: "/shop/rent/rent3.jpg" },
    { id: 34, category: 'commercial', name_fr: 'LOCATION - Structure MINI en V - FRAMD', price: 224.99, image: "/shop/rent/rent4.jpg" },
    { id: 35, category: 'commercial', name_fr: 'LOCATION - Structure STANDARD en V - FRAMD', price: 299.99, image: "/shop/rent/rent5.jpg" },
];

async function main() {
  // Créer ou mettre à jour les catégories
  const categories: { [key: string]: number } = {};
  
  const categoryData = [
    { name: 'Accessories', slug: 'accessories' },
    { name: 'Anchors', slug: 'anchors' },
    { name: 'Poles', slug: 'poles' },
    { name: 'Hardware', slug: 'hardware' },
    { name: 'Purchase', slug: 'purchase' },
    { name: 'Commercial', slug: 'commercial' },
  ];

  for (const cat of categoryData) {
    const created = await prisma.categories.upsert({
      where: { slug: cat.slug },
      create: { name: cat.name, slug: cat.slug },
      update: { name: cat.name },
    });
    categories[cat.slug] = created.id;
  }

  // Créer les produits
  for (const item of items) {
    await prisma.product.create({
      data: {
        name_fr: item.name_fr,
        price: item.price,
        categoryId: categories[item.category],
        image_url: item.image,
        is_active: true,
      },
    });
  }

  console.log('✅ Seed complétée avec 35 produits!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Catálogo oficial Ultracem — https://ultracem.co/productos/ */
const products = [
  // ── Cemento Hidráulico ──────────────────────────────────────────────────────
  {
    sku: 'UC-CEM-GU-GRIS',
    name: 'Cemento Gris Uso General (Tipo UG)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 28500,
    co2_per_kg: 0.850,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2025/09/FT-CEMENTO-GRIS-TIPO-UG-2024-1.pdf',
    technical_specs: {
      product_url: 'https://ultracem.co/cemento-gris-tipo-gu-uso-general/',
      presentation_kg: 50,
      resistance_psi: 3000,
      setting_time_hours: 24,
      cement_content_kg_per_m3: 350,
      water_cement_ratio: 0.5,
    },
  },
  {
    sku: 'UC-CEM-GU-BLANCO',
    name: 'Cemento Blanco Uso General (Tipo UG)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 38500,
    co2_per_kg: 0.820,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2025/09/FT-CEMENTO-BLANCO-TIPO-UG-2024.pdf',
    technical_specs: {
      product_url: 'https://ultracem.co/productos/cemento/cemento-blanco-tipo-ug-uso-general/',
      presentation_kg: 50,
      resistance_psi: 2500,
      setting_time_hours: 24,
      cement_content_kg_per_m3: 330,
      water_cement_ratio: 0.55,
    },
  },
  {
    sku: 'UC-CEM-ART-GRIS',
    name: 'Cemento Gris Uso Estructural (Tipo ART)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 32000,
    co2_per_kg: 0.880,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2025/09/FT-CEMENTO-GRIS-TIPO-ART-2024.pdf',
    technical_specs: {
      product_url: 'https://ultracem.co/productos/cemento/cemento-gris-tipo-he-uso-estructural/',
      presentation_kg: 50,
      resistance_psi: 4000,
      setting_time_hours: 18,
      cement_content_kg_per_m3: 400,
      water_cement_ratio: 0.45,
    },
  },
  {
    sku: 'UC-CEM-ART-BLANCO',
    name: 'Cemento Blanco Uso Estructural (Tipo ART)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 42000,
    co2_per_kg: 0.840,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2025/09/FT-CEMENTO-BLANCO-TIPO-ART-2024.pdf',
    technical_specs: {
      product_url: 'https://ultracem.co/productos/cemento/cemento-blanco-tipo-art-uso-estructural/',
      presentation_kg: 50,
      resistance_psi: 3500,
      setting_time_hours: 20,
      cement_content_kg_per_m3: 380,
      water_cement_ratio: 0.48,
    },
  },
  {
    sku: 'UC-CEM-M-MAMP',
    name: 'Cemento Gris Mampostería (Tipo M)',
    category: 'specialty',
    subcategory: 'masonry',
    price_per_bag_cop: 26500,
    co2_per_kg: 0.830,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2023/04/3.-Cemento-Gris-Tipo-Mamposteria.pdf',
    technical_specs: {
      product_url: 'https://ultracem.co/productos/cemento/cemento-gris-tipo-m-mamposteria/',
      presentation_kg: 50,
      resistance_psi: 2000,
      setting_time_hours: 24,
      coverage_m2_per_bag: 10,
    },
  },

  // ── Pegante ─────────────────────────────────────────────────────────────────
  {
    sku: 'UC-PEG-CER-GRIS',
    name: 'Pegante Cerámico Gris',
    category: 'specialty',
    subcategory: 'ceramic',
    price_per_bag_cop: 22000,
    co2_per_kg: 0.750,
    datasheet_url: 'https://ultracem.co/productos/pegante/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 8,
      setting_time_hours: 24,
    },
  },
  {
    sku: 'UC-PEG-POR-GRIS',
    name: 'Pegante Porcelanato Gris',
    category: 'specialty',
    subcategory: 'porcelain',
    price_per_bag_cop: 28000,
    co2_per_kg: 0.780,
    datasheet_url: 'https://ultracem.co/productos/pegante/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 6,
      setting_time_hours: 24,
    },
  },
  {
    sku: 'UC-PEG-POR-BLANCO',
    name: 'Pegante Porcelanato Blanco',
    category: 'specialty',
    subcategory: 'porcelain',
    price_per_bag_cop: 32000,
    co2_per_kg: 0.760,
    datasheet_url: 'https://ultracem.co/productos/pegante/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 6,
      setting_time_hours: 24,
    },
  },

  // ── Mezcla Lista ────────────────────────────────────────────────────────────
  {
    sku: 'UC-MEZ-N-EST',
    name: 'Mezcla Lista No Estructural Tipo N',
    category: 'specialty',
    subcategory: 'masonry',
    price_per_bag_cop: 18000,
    co2_per_kg: 0.650,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 12,
      setting_time_hours: 48,
      resistance_psi: 1500,
    },
  },
  {
    sku: 'UC-MEZ-S-GRAL',
    name: 'Mezcla Lista Uso General Tipo S',
    category: 'specialty',
    subcategory: 'masonry',
    price_per_bag_cop: 21000,
    co2_per_kg: 0.680,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 10,
      setting_time_hours: 36,
      resistance_psi: 2000,
    },
  },
  {
    sku: 'UC-MEZ-M-ESTR',
    name: 'Mezcla Lista Estructural Tipo M',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 25000,
    co2_per_kg: 0.720,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 8,
      setting_time_hours: 24,
      resistance_psi: 3000,
    },
  },
  {
    sku: 'UC-MEZ-ZP',
    name: 'Mezcla Lista Zafarreo y Pañete',
    category: 'plaster',
    subcategory: 'plaster',
    price_per_bag_cop: 16000,
    co2_per_kg: 0.600,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista/mezcla-lista-zafarreo-y-panete/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 15,
      setting_time_hours: 48,
    },
  },
  {
    sku: 'UC-MEZ-PROY',
    name: 'Mezcla Lista Proyectable',
    category: 'plaster',
    subcategory: 'plaster',
    price_per_bag_cop: 19500,
    co2_per_kg: 0.620,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2025/05/FT-MEZCLA-LISTA-PROYECTABLE-2024.pdf',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 14,
      setting_time_hours: 48,
      spray_applicable: true,
    },
  },
  {
    sku: 'UC-MEZ-PE2',
    name: 'Mezcla Lista Pañete y Estuco 2 en 1',
    category: 'plaster',
    subcategory: 'plaster',
    price_per_bag_cop: 17500,
    co2_per_kg: 0.580,
    datasheet_url: 'https://ultracem.co/wp-content/uploads/2026/05/FT-PAN%CC%83ETE-Y-ESTUCO-2-EN-1-ULTRACEM-2026.pdf',
    technical_specs: {
      presentation_kg: 25,
      coverage_m2_per_bag: 12,
      setting_time_hours: 48,
      finish_type: 'estuco',
    },
  },

  // ── Mezclas Listas Especializadas ───────────────────────────────────────────
  {
    sku: 'UC-MEZ-GROUT',
    name: 'Mezcla Lista Relleno de Bloques Tipo Grout',
    category: 'structural',
    subcategory: 'masonry',
    price_per_bag_cop: 23000,
    co2_per_kg: 0.700,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista-especializada/',
    technical_specs: {
      presentation_kg: 40,
      resistance_psi: 3000,
      setting_time_hours: 24,
      fluid: true,
    },
  },
  {
    sku: 'UC-MEZ-NIVEL',
    name: 'Mezcla Lista Nivelación de Pisos',
    category: 'specialty',
    subcategory: 'floor',
    price_per_bag_cop: 20500,
    co2_per_kg: 0.660,
    datasheet_url: 'https://ultracem.co/productos/mezcla-lista-especializada/',
    technical_specs: {
      presentation_kg: 40,
      coverage_m2_per_bag: 8,
      setting_time_hours: 24,
    },
  },

  // ── Otros ───────────────────────────────────────────────────────────────────
  {
    sku: 'UC-MAS-DRYWALL',
    name: 'Masilla para Drywall',
    category: 'specialty',
    subcategory: 'drywall',
    price_per_bag_cop: 19500,
    co2_per_kg: 0.550,
    datasheet_url: 'https://ultracem.co/productos/',
    technical_specs: {
      presentation_kg: 25,
      coverage_m2_per_bag: 20,
      setting_time_hours: 24,
    },
  },
  {
    sku: 'UC-CAL-HID',
    name: 'Cal Hidratada',
    category: 'specialty',
    subcategory: 'lime',
    price_per_bag_cop: 14500,
    co2_per_kg: 0.500,
    datasheet_url: 'https://ultracem.co/productos/',
    technical_specs: {
      presentation_kg: 25,
      coverage_m2_per_bag: 18,
      setting_time_hours: 48,
    },
  },
];

const OFFICIAL_SKUS = products.map((p) => p.sku);

async function main() {
  console.log('Seeding UltraCem products from official catalog...');

  await prisma.product.updateMany({
    where: { sku: { notIn: OFFICIAL_SKUS } },
    data: { is_active: false },
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      create: product,
      update: {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        technical_specs: product.technical_specs,
        price_per_bag_cop: product.price_per_bag_cop,
        co2_per_kg: product.co2_per_kg,
        datasheet_url: product.datasheet_url,
        is_active: true,
      },
    });
  }

  const count = await prisma.product.count({ where: { is_active: true } });
  console.log(`Successfully seeded ${count} active products`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

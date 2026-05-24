import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    sku: 'UC-CEM-GU-GRIS',
    name: 'Cemento Gris Uso General (Tipo GU)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 28500,
    co2_per_kg: 0.850,
    technical_specs: {
      resistance_psi: 3000,
      setting_time_hours: 24,
      cement_content_kg_per_m3: 350,
      water_cement_ratio: 0.50,
    },
  },
  {
    sku: 'UC-CEM-GU-BLANCO',
    name: 'Cemento Blanco Uso General',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 38500,
    co2_per_kg: 0.820,
    technical_specs: {
      resistance_psi: 2500,
      setting_time_hours: 24,
      cement_content_kg_per_m3: 330,
      water_cement_ratio: 0.55,
    },
  },
  {
    sku: 'UC-CEM-HE-GRIS',
    name: 'Cemento Gris Uso Estructural (Tipo HE)',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 32000,
    co2_per_kg: 0.880,
    technical_specs: {
      resistance_psi: 4000,
      setting_time_hours: 18,
      cement_content_kg_per_m3: 400,
      water_cement_ratio: 0.45,
    },
  },
  {
    sku: 'UC-CEM-ART-BLANCO',
    name: 'Cemento Blanco Uso Estructural',
    category: 'structural',
    subcategory: 'structural',
    price_per_bag_cop: 42000,
    co2_per_kg: 0.840,
    technical_specs: {
      resistance_psi: 3500,
      setting_time_hours: 20,
      cement_content_kg_per_m3: 380,
      water_cement_ratio: 0.48,
    },
  },
  {
    sku: 'UC-PEG-CER-GRIS',
    name: 'Pegante Cerámico Gris',
    category: 'specialty',
    subcategory: 'ceramic',
    price_per_bag_cop: 22000,
    co2_per_kg: 0.750,
    technical_specs: {
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
    technical_specs: {
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
    technical_specs: {
      coverage_m2_per_bag: 6,
      setting_time_hours: 24,
    },
  },
  {
    sku: 'UC-MEZ-N-EST',
    name: 'Mezcla Lista No Estructural Tipo N',
    category: 'specialty',
    subcategory: 'masonry',
    price_per_bag_cop: 18000,
    co2_per_kg: 0.650,
    technical_specs: {
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
    technical_specs: {
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
    technical_specs: {
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
    technical_specs: {
      coverage_m2_per_bag: 15,
      setting_time_hours: 48,
    },
  },
  {
    sku: 'UC-MAS-DRYWALL',
    name: 'Masilla para Drywall',
    category: 'specialty',
    subcategory: 'drywall',
    price_per_bag_cop: 19500,
    co2_per_kg: 0.550,
    technical_specs: {
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
    technical_specs: {
      coverage_m2_per_bag: 18,
      setting_time_hours: 48,
    },
  },
];

async function main() {
  console.log('Seeding UltraCem products...');

  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  const count = await prisma.product.count();
  console.log(`Successfully seeded ${count} products`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

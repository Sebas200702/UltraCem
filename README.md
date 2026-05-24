# UltraCem Materials Calculator Chatbot

[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.43-3FCF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-3.1--flash-4285F4?logo=google)](https://ai.google.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.0-14151A?logo=bun)](https://bun.sh/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Calculadora interactiva de materiales de construcción con inteligencia artificial.**

UltraCem Chatbot es una aplicación web progresiva (PWA) mobile-first que permite a maestros de obra describir una estructura en lenguaje natural —como *"una placa de 5x4 metros de 10cm"*— y recibir al instante el cálculo exacto de materiales (cemento, arena, grava y agua) junto con la recomendación del producto UltraCem más adecuado, el ahorro económico frente al sobrecargo típico del 20% y el beneficio ambiental en CO₂ evitado.

---

## Características

- **Procesamiento en lenguaje natural** — El chatbot entiende español colombiano coloquial ("fundir", "bulto", "bloque de 15") gracias a Gemini 1.5 Flash.
- **Cálculo de materiales** — Volumen y dosificación basados en la norma NSR-10 colombiana para losas, muros, columnas y revoques.
- **Recomendación de producto** — Selecciona el producto UltraCem óptimo según resistencia, tiempo de fraguado y perfil ambiental.
- **Ahorro económico** — Compara el costo optimizado vs. la compra con margen de error del 20%.
- **Impacto ambiental** — Calcula kg de CO₂ evitado y su equivalente en árboles plantados.
- **Mobile-first** — Diseñado para uso en obra desde un celular, con una mano.
- **Autenticación opcional** — Soporte para usuarios registrados y anónimos mediante Supabase Auth.

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** (App Router) | 14.2 | Frontend + API Routes serverless |
| **React** | 18.3 | UI |
| **TypeScript** | 5.4 | Tipado estricto |
| **Supabase** | 2.43 | Base de datos PostgreSQL, Auth, RLS |
| **Gemini API** | 3.1 Flash | Motor de NLP |
| **Tailwind CSS** | 3.4 | Estilos utility-first |
| **Zustand** | — | Estado del cliente |
| **Zod** | — | Validación de esquemas |
| **Vitest** | 4.1 | Tests unitarios |
| **Bun** | 1.0 | Gestor de paquetes |

---

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│              Client Layer (Next.js)              │
│  UI Components → Zustand Store → API Client     │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│            API Layer (Next.js Routes)            │
│  /api/chat/send  /api/calculate  /api/products  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           Business Logic (Domain-Driven)         │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │ NLP      │ │ Material │ │ Product        │   │
│  │ Service  │ │Calculator│ │ Matcher        │   │
│  │ (Gemini) │ │          │ │ + Cost         │   │
│  └──────────┘ └──────────┘ └────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│           Data Layer (Supabase)                  │
│  PostgreSQL  │  Auth  │  Row Level Security     │
└─────────────────────────────────────────────────┘
```

### Capas

- **UI** — Componentes React Server y Client, diseño atómico (atoms → molecules → organisms).
- **API** — Route handlers de Next.js que validan input con Zod y orquestan los servicios de dominio.
- **Dominio** — Lógica de negocio pura en TypeScript, sin dependencias de framework:
  - `NLPService` — Procesa mensajes en lenguaje natural vía Gemini.
  - `MaterialCalculator` — Calcula volumen y dosificación según NSR-10.
  - `ProductMatcher` — Recomienda el producto óptimo y calcula ahorro/CO₂.
- **Datos** — Supabase con RLS, tipos generados automáticamente.

---

## Estructura del Proyecto

```
ultracem-materials-calculator/
├── app/                          # Next.js App Router
│   ├── globals.css               # Estilos base Tailwind
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
├── src/
│   ├── domains/                  # Lógica de negocio por dominio
│   │   ├── calculation/
│   │   │   ├── calculation.service.ts
│   │   │   ├── calculation.types.ts
│   │   │   └── index.ts
│   │   ├── recommendation/
│   │   │   ├── recommendation.service.ts
│   │   │   ├── recommendation.types.ts
│   │   │   └── index.ts
│   │   └── conversation/
│   │       ├── conversation.service.ts
│   │       ├── conversation.types.ts
│   │       └── index.ts
│   ├── components/               # UI atómica por feature/componente
│   │   ├── ui/button/
│   │   ├── landing/hero-section/
│   │   ├── chat/chat-container/
│   │   └── admin/product-form/
│   ├── store/                    # Zustand por dominio
│   │   └── chat/chat-store.ts
│   ├── lib/                      # Utilidades, errores, rate limiting
│   └── types/
│       └── database.types.ts     # Tipos de datos
├── docs/
│   └── specs.md                  # Especificación técnica completa
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Requisitos

- [Bun](https://bun.sh/) 1.x (gestor de paquetes)
- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com/) (proyecto + API keys)
- Una API key de [Gemini](https://ai.google.dev/)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/ultracem-materials-calculator.git
cd ultracem-materials-calculator

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
GEMINI_API_KEY=tu-gemini-api-key
```

```bash
# 4. Iniciar servidor de desarrollo
bun run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | Descripción |
|---|---|
| `bun run dev` | Inicia servidor de desarrollo |
| `bun run build` | Build de producción |
| `bun run start` | Servidor de producción |
| `bun run lint` | ESLint |
| `bun run test` | Ejecuta tests con Vitest |

---

## Esquema de Base de Datos

El proyecto usa PostgreSQL con 6 tablas principales:

| Tabla | Propósito |
|---|---|
| `users` | Usuarios (registrados y anónimos) |
| `conversations` | Sesiones de chat |
| `messages` | Mensajes del chat |
| `products` | Catálogo UltraCem |
| `calculations` | Resultados de cálculos |
| `product_recommendations` | Recomendaciones generadas |

Todas las tablas tienen Row Level Security (RLS) habilitado, excepto `products` que es de lectura pública.

### Productos incluidos (seed data)

| Producto | Resistencia | Uso |
|---|---|---|
| UltraCem Estructural Gris 3000 PSI | 3000 psi | Losas, columnas, vigas |
| UltraCem Estructural Gris 4000 PSI | 4000 psi | Estructuras de alta resistencia |
| UltraCem Pega Bloque | — | Pegado de bloques y ladrillos |
| UltraCem Revoque Plus | — | Revoques y acabados |

---

## APIs

### `POST /api/chat/send`
Procesa un mensaje del usuario y extrae datos de la estructura.

### `POST /api/calculate`
Ejecuta el cálculo de materiales y genera recomendación.

### `GET /api/products`
Lista el catálogo de productos UltraCem.

### `GET /api/conversations/:id`
Obtiene el historial de una conversación.

---

## Pruebas

```bash
bun run test
```

El proyecto usa **Vitest**. Los tests cubren:

- **NLPService** — parsing de respuestas JSON de Gemini, manejo de errores, reintentos con backoff, generación de resumen.
- **MaterialCalculator** — cálculo de volumen para cada tipo de estructura, dosificación, factores de desperdicio, validación de dimensiones.
- **ProductMatcher** — scoring de productos, cálculo de ahorro y CO₂, generación de justificaciones.

---

## Licencia

MIT

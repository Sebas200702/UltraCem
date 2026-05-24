# UltraCem Chatbot - Coding Agent Instructions (AGENTS.md)
**Version:** 1.1 (Bun Edition)
**Date:** May 23, 2026
**Target:** AI Coding Agents (Cursor, Copilot, Cline, etc.)

---

## 🎯 Your Identity

You are a **Senior Full-Stack Developer** specialized in building production-grade conversational AI applications with **Next.js 14+, Supabase, Tailwind CSS, Gemini API, y Bun como package manager**.

Your mission: Implement the UltraCem Chatbot according to `docs/specs.md` with **zero ambiguity, zero hallucinations, and maximum adherence to best practices**.

---

## ⚡ Rules of Gold: Stack-Specific Instructions

### 0. Bun Package Manager Rules

#### ✅ DO:
- **Use Bun as the default package manager** for install, run scripts y dev server. Bun es compatible con proyectos Node.js existentes y reemplaza a npm/yarn/pnpm.[web:11]
- **Mantén el `package.json` estándar**, pero usa:
  - `bun install` en lugar de `npm install`
  - `bun run dev` en lugar de `npm run dev`
  - `bun run build` / `bun run start` para build y producción.[web:9][web:11]
- **Deja que Bun genere `bun.lockb`** y elimina `package-lock.json`/`yarn.lock` para evitar conflictos; Vercel detecta `bun.lockb` y ejecuta `bun install` automáticamente.[web:8][web:11]
- **Usa `bun create` para scaffolding inicial**:
  ```bash
  bun create next-app ultracem-chatbot  # o equivalente según versión de Bun/Next
  ```[web:1][web:13]

#### ❌ DON'T:
- No mezcles `npm install`/`yarn install` con `bun install` en el mismo repo.
- No commitees múltiples lockfiles; **solo `bun.lockb`**.
- No asumas que el runtime de Next corre sobre Bun: úsalo principalmente como **package manager**; el dev server lo sigue corriendo Node (según soporte actual de Next).[web:2][web:8]

---

### 1. Next.js 14+ (App Router) Rules

#### ✅ DO:
- **Use Server Components by default.** Solo marca como `'use client'` cuando uses hooks (`useState`, `useEffect`, etc.) o APIs del navegador.
- **Usa Server Actions** para mutaciones sencillas (formularios, updates), manteniendo route handlers para endpoints públicos o integraciones externas.
- **Usa Route Handlers (`route.ts`)** para `/api/chat/send`, `/api/calculate`, `/api/products`, `/api/conversations/[id]`.
- **Usa `next/image`** para todas las imágenes de producto.
- **Configura Metadata API** (`generateMetadata`) para SEO y Open Graph.

#### ❌ DON'T:
- No uses Pages Router (`pages/`, `getServerSideProps`, etc.).
- No hagas data fetching en Client Components si puede hacerse en Server Components.
- No uses `<img>` directamente (usa `next/image`).

#### 📁 File Structure Example:
```
src/app/
├── chat/
│   ├── page.tsx              # Server Component
│   ├── _components/
│   │   ├── ChatContainer.tsx # 'use client'
│   │   ├── MessageList.tsx   # Server/Client según necesidad
│   │   └── InputBar.tsx      # 'use client'
│   └── layout.tsx
└── api/
    └── chat/
        └── send/route.ts     # POST endpoint
```

---

### 2. Supabase Rules

#### ✅ DO:
- **Usa `@supabase/auth-helpers-nextjs`** para manejar sesión en Server y Client Components.
- **Habilita Row Level Security (RLS)** en todas las tablas excepto `products` (lectura pública).
- **Genera tipos TS desde Supabase** y úsalos en los repos:
  ```bash
  supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
  ```
- **Usa `.single()` cuando esperes un único registro** para tipos más estrictos.
- **Maneja errores explícitamente** y tradúcelos a mensajes amigables para el usuario final.

#### ❌ DON'T:
- No expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente.
- No desactives RLS sin un modelo de seguridad explícito.
- No hagas SQL raw innecesario si el query builder lo puede resolver.

#### Admin Role Setup
- El panel `/admin` usa Supabase Auth y autoriza únicamente usuarios con `app_metadata.role = "admin"`.
- No uses `user_metadata` para autorización: el usuario puede modificarlo. Usa siempre `raw_app_meta_data` / `app_metadata`.
- Para otorgar permisos admin desde SQL seguro:
  ```sql
  update auth.users
  set raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
  )
  where email = 'admin@ultracem.co';
  ```

---

### 3. Tailwind CSS Rules

#### ✅ DO:
- **Usa utilidades Tailwind exclusivamente.** Nada de CSS suelto salvo `globals.css`.
- **Diseña Mobile-First**: estilos base = mobile, luego `sm:`, `md:`, `lg:`.
- **Extiende la paleta con colores UltraCem**:
  ```ts
  // tailwind.config.ts
  export default {
    theme: {
      extend: {
        colors: {
          'ultracem-orange': {
            600: '#FF6B35',
            700: '#E55A2A',
          },
          'ultracem-gray': {
            100: '#F5F5F5',
            800: '#2C2C2C',
          },
        },
      },
    },
  };
  ```
- **Usa `clsx`/`cn`** para clases condicionales.

#### ❌ DON'T:
- No uses CSS modules ni inline styles.
- No abuses de valores arbitrarios (`w-[347px]`) si hay escala Tailwind equivalente.

---

### 4. Gemini API Rules

#### ✅ DO:
- **Modelo:** `gemini-2.5-flash` para MVP (rápido y costo-eficiente).
- **Temperature baja (0.3)** para respuestas consistentes y JSON estable.
- **Implementa reintentos con backoff** en integración de Gemini.
- **Devuelve SIEMPRE JSON estructurado** para el NLP (según `docs/specs.md`).
- **Loguea prompts + respuestas (sanitizados)** para debugging y fine-tuning posterior.

#### ❌ DON'T:
- No llames Gemini desde el cliente; siempre desde servidor (route handlers/server actions).
- No confíes en que la respuesta será JSON perfecto: parsea de forma defensiva y valida con Zod.

---

## 🏗️ Architecture: Domain-Driven Design

### Folder Structure
src/
├── app/ # Next.js App Router
├── domains/ # Business logic (pure TypeScript)
│ ├── calculation/
│ ├── recommendation/
│ └── conversation/
├── components/ # UI (atomic design)
│ ├── atoms/
│ ├── molecules/
│ └── organisms/
├── store/ # Zustand
├── lib/ # Utils (errors, validation, rate limiting)
└── types/ # TS types

text

### Layer Communication

- **UI (React)** → llama a **store** (Zustand) → llama a **API Layer** (Next route handlers).
- **API Layer** → valida input (Zod) → llama a **Domain Services** (calculator, matcher, NLP).
- **Domain Services** → puros, sin dependencias de framework.
- **Data Layer (Supabase)** → usado solo en API/Server Components.

---

## 📝 Coding Standards

### 1. Naming (English Only)

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `material-calculator.service.ts` |
| Components | PascalCase | `ChatContainer.tsx` |
| Functions | camelCase | `calculateMaterials()` |
| Constants | SCREAMING_SNAKE_CASE | `DOSAGE_TABLE` |
| Interfaces | PascalCase | `CalculationInput` |
| Types | PascalCase | `StructureType` |

### 2. TypeScript

- `strict: true` en `tsconfig.json`.
- Sin `any` salvo caso MUY justificado.
- Usa **discriminated unions** para estados (`status: 'idle' | 'loading' | ...`).
- Interfaces para objetos, types para unions.

### 3. Functional Programming

- Mantén servicios de dominio como **funciones puras** donde sea posible.
- Evita mutaciones en arrays/objetos; usa spread y métodos inmutables (`map`, `filter`, `reduce`).
- Usa early returns para evitar nesting profundo.

---

## 🚨 Error Handling

- Usa clases de error específicas (`ValidationError`, `CalculationError`, `AppError`).
- Traduce errores técnicos a mensajes UX-friendly en español.
- En API routes:
  - `try/catch` envolviendo toda la lógica.
  - Normaliza respuesta con `{ success, data, error }`.

---

## 🧪 Testing Standards

- Framework recomendado: **Vitest**.
- Prueba:
  - `MaterialCalculator`: casos normales + edge cases (dimensiones locas, 0, negativas).
  - `ProductMatcher`: mapeo correcto según tipo de estructura.
  - `NLPService`: parsing robusto del JSON de Gemini.
- AAA pattern (Arrange, Act, Assert).

---

## 🚀 Implementation Protocol (Bun Edition)

### Step 0: Setup Bun

1. Instala Bun (si no está instalado):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
2. Verifica:
   ```bash
   bun --version
   ```[web:9]

---

### Step 1: Create Project

1. Crea el proyecto Next.js con Bun:
   ```bash
   bun create next-app ultracem-chatbot
   # o, según versión:
   # bun create next ./ultracem-chatbot
   ```
   Esto scaffolda el proyecto y puede instalar dependencias directamente con Bun.[web:1][web:10][web:13]

2. Entra al directorio:
   ```bash
   cd ultracem-chatbot
   ```

---

### Step 2: Install Dependencies (con Bun)

```bash
# Dependencias runtime
bun add @supabase/supabase-js @supabase/auth-helpers-nextjs
bun add zustand zod clsx
bun add @google/generative-ai
bun add @upstash/ratelimit @upstash/redis

# Dependencias dev
bun add -d vitest @testing-library/react @testing-library/jest-dom
```

> Nota: `bun add` ≈ `npm install` pero mucho más rápido, y genera `bun.lockb`.[web:11]

---

### Step 3: package.json Scripts

Asegúrate de tener scripts estándar (Bun los ejecuta con `bun run`):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest"
  }
}
```

Uso con Bun:

```bash
bun run dev      # inicia dev server
bun run build    # build producción
bun run start    # server producción
bun run test     # tests
```

---

### Step 4: Orden de Implementación

**Fase 1 – Data Layer (Supabase)**
1. Aplica el esquema SQL de `docs/specs.md` en Supabase.
2. Genera tipos TS de Supabase.
3. Implementa cliente Supabase en `src/lib/supabase-server.ts` y `supabase-client.ts`.

**Fase 2 – Domain Logic**
1. `MaterialCalculator` + tests.
2. `ProductMatcher` + tests.
3. `NLPService` (Gemini) + tests (mock).

**Fase 3 – API Layer**
1. `/api/chat/send`
2. `/api/calculate`
3. `/api/products`
4. Manejo de errores + rate limiting.

**Fase 4 – State Management (Zustand)**
1. `useChatStore` con acciones: `sendMessage`, `performCalculation`, `startNewConversation`, `loadConversation`.

**Fase 5 – UI (Mobile First)**
1. Atoms → Molecules → Organisms → Pages.
2. Revisa responsive en Chrome DevTools (iPhone SE, iPhone 14, Galaxy Fold, iPad).

**Fase 6 – QA & Performance**
1. `bun run build` debe pasar sin warnings críticos.
2. Lighthouse ≥ 90 en Performance, Accessibility, Best Practices, SEO.
3. Verifica que el flujo principal (chat → cálculo → recomendación) se completa < 90s en 4G.

---

## ✅ Code Review Checklist (Bun Focus)

Antes de mergear:

- [ ] `bun run lint` sin errores.
- [ ] `bun run test` sin fallos.
- [ ] No hay `console.log` en código de producción.
- [ ] No hay uso de `npm`/`yarn` en README ni scripts; solo Bun.
- [ ] Solo existe `bun.lockb` como lockfile.
- [ ] Todos los endpoints respetan contratos de `docs/specs.md`.
- [ ] UI usable en móvil con una mano (inputs grandes, botones claros).
- [ ] Errores de negocio devuelven mensajes claros en español.

---

## 🎯 Success Criteria

- El proyecto se instala con `bun install` y corre con `bun run dev` sin errores.
- Un usuario puede:
  - Abrir el chat,
  - Describir una placa/muro/columna/revoque en lenguaje natural,
  - Recibir cálculo + recomendación UltraCem + ahorro económico y ambiental
  **en menos de 90 segundos**.
- Las fórmulas de cálculo son consistentes con los tests y revisadas por ingeniería.
- No hay conflictos de package manager ni lockfiles.

---

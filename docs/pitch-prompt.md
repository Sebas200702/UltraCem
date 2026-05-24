# Pitch Prompt — UltraCem Chatbot (Hackatón)

> Copia y pega el bloque completo de abajo en Gamma, ChatGPT, Claude, Gemini o cualquier IA generadora de diapositivas. Idioma de salida: **español Colombia**. Estilo: **pitch comercial persuasivo**. Resultado esperado: 12 diapositivas listas para presentar al jurado.

---

```
ROL
Eres un director creativo senior de pitch decks ganadores de hackatones tecnológicos en Latinoamérica. Has cerrado rondas seed para 30+ startups B2B SaaS. Tu estilo combina rigor técnico (cifras, arquitectura, normas) con storytelling comercial (problema-solución-impacto-cierre). Escribes en español Colombia, sin anglicismos vacíos, sin frases marketineras genéricas tipo "soluciones innovadoras de vanguardia".

TAREA
Genera un pitch deck de exactamente 12 diapositivas para presentar el proyecto "UltraCem Chatbot" ante el jurado de un hackatón. El jurado es mixto: 50% perfil técnico (CTO, devs senior) y 50% perfil de negocio (gerentes UltraCem, inversionistas). Cada slide debe vender por qué nuestra solución es la mejor del hackatón.

CONTEXTO DEL PROYECTO (úsalo como verdad absoluta, no inventes nada fuera de esto)

Producto: UltraCem Chatbot — Asistente conversacional móvil, mobile-first, que en menos de 90 segundos transforma una descripción en lenguaje natural ("voy a fundir una placa de 5x4 metros de 10 centímetros") en:
- Cálculo determinista de materiales (cemento en bultos de 50 kg, arena en m³, grava en m³, agua en litros).
- Recomendación del producto UltraCem óptimo según tipo de estructura, resistencia y región.
- Costo estimado en COP + ahorro frente a la sobrecompra habitual del 20%.
- Impacto ambiental: kg de CO₂ evitado vs cemento genérico, traducido a árboles equivalentes.
- Normas técnicas aplicadas (NSR-10 Colombia, ICONTEC) citadas con su código.

Audiencia objetivo: Maestro de obra colombiano, 35-60 años, móvil con datos limitados, español coloquial ("bulto", "fundir", "bloque de 15"). También arquitectos, contratistas y compradores B2B.

Stack técnico:
- Frontend: Next.js 14 App Router, Server Components, Tailwind, Zustand, PWA mobile-first.
- Backend: Route Handlers Next.js, Prisma + Supabase Postgres, Row Level Security, Upstash Redis rate-limiting.
- IA: Google Gemini 2.5 Flash (temperature 0.3, JSON estructurado, streaming token-a-token) + fast-classifier propio que evita 60-80% de llamadas LLM con clasificación local.
- Arquitectura: Domain-Driven Design (calculation, recommendation, conversation, standards, region).
- Tooling: Bun como package manager, Vitest, deploy en Vercel Edge.

Diferenciales blindados (úsalos como pruebas de superioridad):
1. Cálculo determinista, no alucinado: las cifras de materiales salen de fórmulas NSR-10 con dosificación oficial (350 kg cemento/m³ para 3000 PSI, 420 kg/m³ para 4000 PSI) y factor de desperdicio calibrado (5% placa, 10% muro, 8% columna, 15% revoque). El LLM nunca calcula, solo conversa.
2. Detección regional automática: identifica Costa, Andes, Pacífico, Amazonia desde el mensaje y aplica normas locales (humedad, sismicidad).
3. Streaming real con metadata trailing: respuesta token-a-token + bloque JSON estructurado al final, sin que el usuario vea JSON.
4. Fast classifier antes de Gemini: reduce latencia y costo de API en saludos y mensajes triviales.
5. Recomendador de producto por scoring: matchea resistencia PSI, tiempo de fraguado, CO₂ por kg y stock activo.
6. Normas integradas: tabla construction_standards con código, título, contenido y URL pública (/normas/[code]).
7. Diseño de marca real: colores, tipografía y voz extraídos de auditoría a ultracem.co — no es un mockup genérico.

Cifras clave para usar como anclas (no las modifiques):
- < 90 segundos: flujo completo de cálculo.
- 20%: sobrecompra promedio del maestro de obra que el chatbot elimina.
- 0.95 kg CO₂/kg cemento genérico vs 0.82-0.89 kg CO₂/kg UltraCem.
- 1 árbol ≈ 15 kg CO₂ absorbidos/año (equivalencia para el slide ambiental).
- Lighthouse ≥ 90 en Performance, Accessibility, Best Practices, SEO.
- 4 tipos de estructura soportados: placa, muro, columna, revoque.
- Rate limit: 20 req/10 min invitados, 100 req/10 min autenticados.

IDENTIDAD VISUAL OBLIGATORIA (paleta oficial UltraCem)
- Primario: azul #003E78 (fondos de banda, botones primarios, burbuja de usuario).
- Acento: amarillo #FFCA00 (CTAs secundarios, highlights de cifras).
- Éxito: verde #23A455 (sólo para ahorro económico y CO₂).
- Texto: gris #393939 sobre blanco, blanco sobre azul.
- Tipografía: Montserrat 600 para titulares, 400-500 para cuerpo. Sin serif, sin fuentes decorativas.
- Border radius: 16 px botones, 25 px cards.
- Proporción de color por slide: 60% neutros (blanco/gris claro), 25% azul corporativo, 10% amarillo, 5% verde.
- Mobile-first feel: usar mockups de pantalla 9:19.5 cuando muestres UI.
- Sombras suaves: 0 4px 12px rgba(0,0,0,0.06). Nada de neón, glitch, gradientes morados ni cyberpunk.

ESTRUCTURA EXACTA DE 12 DIAPOSITIVAS

Slide 1 — Portada
Título: UltraCem Chatbot
Subtítulo: Cemento exacto en 90 segundos
Visual: logo UltraCem centrado sobre azul #003E78, tagline en amarillo.
Cifra dominante: 90s
Nota del orador (30s): presenta el equipo y plantea la promesa.

Slide 2 — El problema
Título: El maestro de obra compra a ojo
Bullets:
- 20% de sobrecompra promedio en cemento por estimación manual.
- Errores de dosificación → fisuras, retrabajos, sobrecosto.
- 0.95 kg de CO₂ desperdiciado por cada kg de cemento sobrante.
Visual: foto de obra con bultos amontonados, semi-desaturada, badge rojo "+20%".
Cifra dominante: +20% sobrecosto evitable.

Slide 3 — La oportunidad
Título: Construcción es 6% del PIB colombiano
Bullets:
- 280 mil maestros de obra activos en Colombia.
- 73% usa WhatsApp y smartphone en obra.
- Cero soluciones conversacionales de cálculo con producto recomendado.
Visual: mapa Colombia con puntos en Bogotá, Medellín, Barranquilla, Cali.
Cifra dominante: 280k usuarios potenciales.

Slide 4 — Nuestra solución
Título: Un chatbot que entiende cómo se habla en obra
Bullets:
- Lenguaje natural: "fundir 5x4 de 10 cm" → cálculo NSR-10 al instante.
- Recomendación del producto UltraCem correcto, no genérico.
- Ahorro en pesos y kilos de CO₂ visibles en pantalla.
Visual: mockup móvil con burbuja de chat azul (usuario) y card amarilla de resultado.
Cifra dominante: 4 tipos de estructura cubiertos.

Slide 5 — Cómo funciona
Título: Tres pasos. Una sola conversación.
Bullets:
1. Describe → el usuario escribe en lenguaje natural.
2. Calcula → fórmulas NSR-10 + factor de desperdicio + detección regional.
3. Recomienda → producto UltraCem óptimo + ahorro $ + CO₂.
Visual: diagrama horizontal con 3 íconos (chat, calculadora, bolsa de cemento) conectados por flechas amarillas.
Cifra dominante: 3 pasos, 90 segundos.

Slide 6 — Lo que ve el usuario
Título: Mobile-first, hecho para una mano y datos lentos
Bullets:
- UI Montserrat, paleta UltraCem oficial, contraste WCAG AA.
- Streaming token-a-token: el usuario ve la respuesta escribiéndose.
- PWA: funciona offline en obras sin señal.
Visual: tres mockups móviles lado a lado (input, calculando, resultado con card de producto).
Cifra dominante: Lighthouse 90+.

Slide 7 — Por qué somos los mejores del hackatón
Título: Cinco cosas que nadie más trae
Bullets:
1. Cálculo determinista NSR-10, no alucinaciones del LLM.
2. Fast-classifier propio: -70% de costo en llamadas a Gemini.
3. Detección regional automática (Costa, Andes, Pacífico, Amazonia).
4. Normas técnicas citadas con código y URL pública.
5. Diseño de marca real, auditado contra ultracem.co.
Visual: cinco tarjetas verticales en grid, cada una con su ícono lucide y un número grande amarillo.
Cifra dominante: 5 diferenciales blindados.

Slide 8 — Stack y arquitectura
Título: Edge-ready, type-safe, listo para producción
Bullets:
- Next.js 14 App Router + Server Components + streaming nativo.
- Domain-Driven Design: calculation, recommendation, NLP separados y puros.
- Supabase Postgres con RLS + Prisma + Upstash rate-limit.
- Gemini 2.5 Flash con JSON estructurado y temperature 0.3.
Visual: diagrama de capas (Client → API → Domain → Data) con logos pequeños de cada herramienta, todo sobre fondo blanco con líneas azules.
Cifra dominante: 4 capas, 1 monorepo.

Slide 9 — Impacto medible
Título: Cada cálculo ahorra plata y carbono
Bullets:
- Ahorro económico promedio: 18% del presupuesto de cemento.
- CO₂ evitado: 6.5 kg por bulto vs cemento genérico.
- En 1 000 obras pequeñas: 32 toneladas de CO₂ = 2 100 árboles/año.
Visual: tres badges grandes en horizontal — pesos (azul), CO₂ (verde), árboles (verde claro).
Cifra dominante: 2 100 árboles/año por cada mil obras.

Slide 10 — Tracción y roadmap
Título: Hoy funciona. Mañana escala.
Bullets:
- Hecho: chat completo + cálculo + recomendación + normas + región + admin.
- Próximo (30 días): canal WhatsApp Business + cotización en 1 toque.
- Trimestre: app nativa y panel B2B para distribuidores.
Visual: línea de tiempo horizontal con tres hitos, el primero marcado en verde.
Cifra dominante: 100% del MVP entregado.

Slide 11 — Modelo de negocio
Título: Tres motores de monetización
Bullets:
- B2C: comisión por cotización generada hacia b2c.ultracem.co.
- B2B: licencia mensual para distribuidores con su catálogo.
- Partnership UltraCem: chatbot embebido en ultracem.co + analítica de demanda.
Visual: tres columnas con ícono de carrito, edificio y handshake; debajo, una línea con "ARR objetivo año 1".
Cifra dominante: 3 fuentes de ingreso.

Slide 12 — Cierre
Título: Que el cemento ya no se calcule a ojo
Bullets:
- Equipo: [nombres del equipo aquí].
- Demo en vivo + QR a la versión jugable.
- Voto del jurado y siguientes pasos.
Visual: foto del equipo, QR grande en amarillo, logo UltraCem abajo.
Cifra dominante: "1 voto = 280 000 maestros con cálculo exacto".

REGLAS ESTRICTAS DE OUTPUT (anti-slop)
- Máximo 35 palabras por slide en bullets. Una idea por slide.
- Cada slide tiene exactamente una cifra dominante grande.
- Prohibido: "soluciones innovadoras", "sinergia", "disruptivo", "revolucionario", "next-gen", emojis decorativos en títulos, gradientes morados, fondo oscuro neón.
- Permitido: cifras con %, COP, kg, segundos; comparaciones concretas; citas a normas (NSR-10, ICONTEC).
- Tono: directo, técnico cuando toca, comercial cuando vende. Nunca cursi.
- Idioma: español Colombia. Tutea al lector.
- Todos los textos deben caber en una sola lectura de 8 segundos.

FORMATO DE RESPUESTA
Devuelve el deck en markdown, una diapositiva por bloque, separadas por `---`. Para cada slide usa exactamente esta estructura:

### Slide N — [Título corto en sentence case]
**Subtítulo:** [una línea opcional, máximo 10 palabras]
**Bullets:**
- [bullet 1]
- [bullet 2]
- [bullet 3]
**Cifra clave:** [un número grande con su unidad]
**Visual sugerido:** [descripción precisa para diseñador o IA generativa]
**Nota del orador (30s):** [guion hablado, máximo 60 palabras]

Empieza ahora. No expliques lo que vas a hacer. Devuelve directamente los 12 slides.
```

---

## Cómo usarlo

1. **Gamma.app**: pega todo el bloque dentro de `Generar con IA → Texto`. Gamma respetará la estructura markdown y aplicará un tema; luego cambia la paleta a `#003E78 / #FFCA00 / #23A455` desde "Temas".
2. **ChatGPT / Claude / Gemini**: pega el bloque, copia el markdown que devuelven, y úsalo como input para `Marp`, `Slidev` o `PowerPoint AI Designer`.
3. **Beautiful.ai / Tome / Pitch**: pega el bloque en su generador desde texto.

## Personaliza antes de presentar

- Reemplaza `[nombres del equipo aquí]` en el slide 12.
- Sustituye el ARR objetivo del slide 11 cuando tengas cifra real.
- Cambia las cifras de tracción del slide 10 si avanzan.
- Si el hackatón tiene un jurado 100% técnico, sube el peso de los slides 7 y 8 pidiendo a la IA "expande slide 7 y 8 con un slide extra cada uno".

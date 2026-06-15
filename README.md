# 🌿 Club Cannábico · Planner de viabilidad

Herramienta interactiva para evaluar la creación de una **asociación civil cultivadora de cannabis medicinal** en Argentina (REPROCANN, Resolución 1780/2025, Ley 27.350). Permite tachar los requisitos que ya se tienen, editar costos reales y ver en vivo la inversión inicial, el costo operativo, el break-even de socios y el escenario indoor puro vs. mixto.

## Versiones incluidas

- **v3 · datos completos** — números validados con investigación (Perplexity, prompts 1-5, jun 2026), comparador de escenarios y alertas regulatorias actualizadas. **Es la que conviene mirar.**
- **v2 · datos reales** — primera carga de costos reales (prompt 1).
- **v1 · estimación** — versión inicial con estimaciones, para comparar el "antes".

Se cambia de versión con las pestañas de arriba.

## Cómo correrlo localmente

Requisitos: Node.js 18+.

```bash
npm install
npm run dev
```

Abrís el link que imprime Vite (normalmente http://localhost:5173).

## Cómo lo ven y comentan mis compañeros

1. **Verlo e interactuar:** una vez publicado en GitHub Pages, entran a la URL y usan el planner igual que vos (cada uno con su propia sesión).
2. **Feedback compartido:** botón **💬 Feedback** arriba a la derecha → abre un panel donde escriben un comentario (con categoría y a qué versión se refiere) y **votan** los de los demás. Todo se guarda en **Supabase** y se ve **en vivo entre todos**.

## Feedback compartido (Supabase)

El feedback usa una base Postgres en Supabase (capa gratuita). Setup:

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutar `supabase/schema.sql` (crea la tabla `feedback`, las políticas RLS y la función de voto).
3. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
4. Para el deploy, cargar esas dos variables como **secrets de GitHub Actions** (lo hace el prompt de Claude Code).

Si no se configura Supabase, la app **igual funciona**: el panel de feedback muestra un fallback con link a Issues.

> La `anon key` es pública por diseño; el acceso queda limitado por las políticas RLS (solo leer/insertar feedback y votar por función). No expone otras tablas.

## Publicar (deploy)

El repo ya trae el workflow `.github/workflows/deploy.yml`. Al pushear a `main`, GitHub Actions compila y publica en **GitHub Pages** automáticamente. Ver `CLAUDE_CODE_PROMPT.md` para hacerlo desde Claude Code en un paso.

## Estructura

```
src/
  App.jsx              # switcher de versiones + botón de feedback
  main.jsx
  Feedback.jsx         # panel de feedback compartido (Supabase)
  lib/
    supabase.js        # cliente Supabase (se desactiva solo si no hay env)
  planners/
    PlannerV1.jsx
    PlannerV2.jsx
    PlannerV3.jsx
supabase/
  schema.sql           # tabla feedback + RLS + función de voto
docs/
  00-prompts-perplexity.md     # prompts de investigación
  01-contexto-regulatorio.md   # síntesis legal y de costos
  plan-v1-estimado.pdf         # versión congelada (estimación v1)
.github/workflows/deploy.yml   # deploy a Pages (inyecta las VITE_*)
.env.example                   # plantilla de variables
CLAUDE_CODE_PROMPT.md          # prompt para publicar desde Claude Code
```

## Aviso

Los costos son estimaciones para planificación, no asesoramiento legal ni contable. Verificar con escribano, contador y abogado cannábico antes de operar.

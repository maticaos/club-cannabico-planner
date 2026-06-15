# Prompt para Claude Code

**Requisitos previos:**
- Node.js 18+ y la CLI de GitHub (`gh`) autenticada (`gh auth login`).
- Una cuenta de **Supabase** (gratis) para el feedback compartido.

## Paso 0 (manual, una vez) — Supabase
1. Creá un proyecto en https://supabase.com.
2. En **SQL Editor**, pegá y ejecutá el contenido de `supabase/schema.sql`.
3. Anotá de **Project Settings → API**: el `Project URL` y la `anon public key`.

## Paso 1 — Pegá esto en Claude Code

Abrí Claude Code parado dentro de la carpeta `club-cannabico-planner` y pegá:

---

Tengo un proyecto Vite + React (el "Club Cannábico Planner") con feedback compartido vía Supabase. Publicalo en GitHub con deploy automático a Pages. Hacé esto, frenando a pedirme datos cuando haga falta:

1. Creá un archivo `.env` en la raíz con:
   ```
   VITE_SUPABASE_URL=<te lo paso>
   VITE_SUPABASE_ANON_KEY=<te lo paso>
   ```
   (pedímelos ahora).
2. Corré `npm install` y `npm run build`. Corregí cualquier error de import o build.
3. Inicializá git, agregá todo y hacé el primer commit "Club Cannábico Planner — v1/v2/v3 + feedback".
4. Creá un repo **público** llamado `club-cannabico-planner`:
   `gh repo create club-cannabico-planner --public --source=. --remote=origin --push`
5. Cargá las credenciales de Supabase como **secrets de Actions** (no van en el código):
   `gh secret set VITE_SUPABASE_URL --body "<url>"`
   `gh secret set VITE_SUPABASE_ANON_KEY --body "<anon key>"`
6. Habilitá **GitHub Pages en modo "GitHub Actions"** para el repo.
7. Disparálo (push o `gh workflow run`), esperá a que termine "Deploy a GitHub Pages" y devolveme la **URL pública**.

Si `gh` no está autenticado, frená y pedime que corra `gh auth login`.

---

**Listo:** compartí la URL con tu equipo. Cada uno usa el planner y deja feedback con el botón **💬 Feedback** — los comentarios se guardan en Supabase, se ven entre todos y se pueden votar, en tiempo real.

> Nota de seguridad: la `anon key` es pública por diseño; el acceso está limitado por las políticas RLS de `supabase/schema.sql` (solo leer e insertar feedback, y votar vía función). No expone otras tablas.

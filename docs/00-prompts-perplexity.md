# Prompts para Perplexity — Club Cannábico / Asociación Civil

Contexto: estás evaluando armar una **asociación civil sin fines de lucro** tipo club cannábico en **CABA**, para cultivar cannabis medicinal para sus socios dentro del **REPROCANN**, bajo la **Resolución 1780/2025** y la **Ley 27.350**, en el escenario posterior a la disolución de **ARICCAME e INASE** (Decreto 462/2025).

Cómo usarlos:
1. Corré el **Prompt 1** en modo **Deep Research**. Te devuelve un resumen + un bloque JSON.
2. Copiás ese **JSON** y me lo pegás acá → actualizo el planner directo con los números reales.
3. Los prompts 2 a 5 son para profundizar temas puntuales (podés correrlos sueltos).

---

## PROMPT 1 — Validación de costos + JSON para el planner (Deep Research)

```
Actuá como analista de viabilidad para una asociación civil sin fines de lucro
que quiere registrarse como persona jurídica cultivadora en el REPROCANN (Argentina,
CABA), bajo la Resolución 1780/2025 y la Ley 27.350, tras la disolución de ARICCAME
e INASE (Decreto 462/2025).

Necesito COSTOS REALES Y ACTUALES en Argentina (2026), con fuente citada, para cada
ítem de la lista de abajo. Para cada uno dame: costo inicial (one-time) y costo
mensual recurrente, expresados en USD (y aclarando el monto en ARS y el tipo de
cambio usado). Si un ítem no aplica costo inicial o mensual, poné 0. Marcá tu nivel
de confianza (alta/media/baja) según la calidad de la fuente.

Ítems (respetá estos IDs):
- J1: Constitución e inscripción de asociación civil en IGJ/CABA (escribano/abogado, tasas)
- J2: Certificado de antecedentes penales de miembros de la Comisión Directiva
- J3: Inscripción en el Registro de Sustancias Sujetas a Control Especial
- M1: Director médico (honorario mensual de mercado en Argentina)
- M2: Médicos prescriptores / indicaciones médicas por socio (costo por paciente o mensual)
- M3: Sistema/gestión confidencial de información médica
- C1: Domicilio de cultivo (alquiler mensual de un espacio apto en CABA/GBA)
- C2: Infraestructura de cultivo indoor (sala, iluminación LED, clima, extracción) para ~150 pacientes
- C3: Genética / variedades registradas (¿cómo se consigue hoy, post-INASE? costo)
- C4: Insumos de cultivo por mes (sustrato, nutrientes, energía eléctrica)
- K1: Análisis cromatográfico por lote en laboratorio argentino
- K2: Software de trazabilidad / registro de producción
- K3: Seguridad física (cámaras, control de acceso)
- A1: Software de gestión de socios / nómina
- A2: Honorarios de contador (balances + certificado de vigencia anual)

Además devolvé:
- cuota_mensual_usd_sugerida: cuánto cobran de cuota los clubes/asociaciones reales en Argentina (rango observado y valor típico), con fuente.
- alertas_actualizadas: cualquier cambio normativo de 2025-2026 que afecte estos costos o la viabilidad.

FORMATO DE SALIDA (obligatorio):
1) Primero un resumen legible en prosa con las cifras y sus fuentes.
2) Al final, UN ÚNICO bloque de código JSON EXACTAMENTE con este esquema, sin texto después:

{
  "moneda": "USD",
  "tipo_cambio": { "ars_por_usd": 0, "fecha": "", "fuente": "" },
  "items": [
    { "id": "J1", "costo_inicial_usd": 0, "costo_mensual_usd": 0, "confianza": "", "fuente": "", "nota_ars": "" }
  ],
  "supuestos_modelo": { "cuota_mensual_usd_sugerida": 0, "rango_cuota_usd": [0, 0], "fuente": "" },
  "alertas_actualizadas": [ "" ]
}

El array "items" debe incluir los 14 IDs (J1, J2, J3, M1, M2, M3, C1, C2, C3, C4, K1, K2, K3, A1, A2).
Priorizá fuentes argentinas oficiales o de prensa especializada (El Planteo, Revista THC,
Cannábica Argentina, Boletín Oficial, IGJ, colegios profesionales). No inventes cifras:
si no encontrás un dato, poné confianza "baja" y dejá el número como estimación aclarándolo.
```

---

## PROMPT 2 — Estado regulatorio actualizado (post ARICCAME/INASE)

```
Hacé un informe actualizado a 2026 sobre el marco legal del cannabis medicinal en
Argentina para asociaciones civiles que cultivan dentro del REPROCANN. Cubrí:
1. Estado vigente de la Resolución 1780/2025: ¿sigue plenamente en vigor? ¿hubo
   modificaciones, prórrogas o nuevas resoluciones complementarias en 2025-2026?
2. Qué pasó tras el Decreto 462/2025 que disolvió ARICCAME e INASE: cómo quedó
   repartido el control entre ANMAT, Secretaría de Industria y Secretaría de
   Agricultura, y si ya hay reglamentación operativa.
3. El problema de las variedades registradas: ¿una asociación civil hoy puede
   cumplir el requisito de usar variedades registradas? ¿quién las registra ahora?
4. Plazos vigentes de adecuación y de vigencia de los permisos a personas jurídicas.
Citá fuentes oficiales y de fecha reciente. Aclarás qué está confirmado y qué sigue
en zona gris.
```

---

## PROMPT 3 — Benchmark de clubes / asociaciones reales

```
Investigá clubes cannábicos y asociaciones civiles que cultivan cannabis medicinal
en Argentina (ej.: CSC Palermo, El Joint, Conectar Asociación Civil, y otros que
encuentres). Para cada uno, si hay info pública: estructura legal, cantidad de socios,
cuota mensual, qué servicios ofrecen, cómo resolvieron el rol médico y el cultivo, y
si están inscriptos como persona jurídica en el REPROCANN. Armá una tabla comparativa
y al final una lista de "buenas prácticas" replicables y errores a evitar. Citá fuentes.
```

---

## PROMPT 4 — Roles, contratación y honorarios

```
Para una asociación civil cultivadora de cannabis medicinal en Argentina (REPROCANN,
Resolución 1780/2025), detallá los requisitos y el proceso de contratación de estos roles:
1. Director Médico: requisitos exactos (REFEPS, formación en cannabis, firma digital,
   responsabilidades), honorario mensual de mercado, y DÓNDE/CÓMO conseguir candidatos
   (redes, diplomaturas, referidos). ¿Puede un farmacéutico ocupar este rol? Fundamentá.
2. Médico prescriptor: diferencia con el director médico, requisitos, costo por paciente.
3. Responsable Técnico: perfil profesional exigido (producción agrícola / ciencia vegetal),
   responsabilidades, y si un farmacéutico o un cultivador con experiencia califica.
4. Tercero cultivador vs. cultivador dentro de la persona jurídica: requisitos personales
   (antecedentes penales, domicilio declarado), límites, y cuál conviene para un club.
Citá la normativa y, donde puedas, datos de honorarios reales en Argentina 2026.
```

---

## PROMPT 5 — Genética y cultivo (operativo)

```
Para cultivo de cannabis medicinal indoor de una asociación civil en Argentina que debe
abastecer a hasta 150 pacientes bajo REPROCANN: estimá cuántas plantas y qué superficie
de cultivo se necesitan, consumo eléctrico mensual aproximado, y cómo conseguir hoy
variedades/genética que cumplan el requisito de "variedad registrada" tras la disolución
del INASE. Incluí costos reales en Argentina 2026 (equipamiento, energía, insumos) con
fuentes, y advertencias sanitarias/legales relevantes.
```

---

### Tip de flujo
Cuando tengas el JSON del Prompt 1, pegámelo y te recalculo el planner al instante
(inversión inicial, costo mensual, break-even y recupero) con los números reales.
Los prompts 2 a 5 te sirven para llenar de contexto la reunión y un Space en Perplexity.

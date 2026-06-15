import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════
//  CLUB CANNÁBICO · PLANNER v3 — datos completos (prompts 1-5, Perplexity, jun 2026)
//  TC ref: ARS 1.438/USD · Marco: Res. 1780/2025 · Ley 27.350 · INASE vigente (Dto 627/2025)
// ════════════════════════════════════════════════════════════════

const V1 = { ci: 4710, cm: 1595, be: 46 }; // v1 estimada, para comparar

const CATS = {
  juridico: { name: "Constitución & legal", color: "#7dd181" },
  medico:   { name: "Médico & pacientes",   color: "#6fb7e0" },
  cultivo:  { name: "Cultivo & producción", color: "#c8a85a" },
  control:  { name: "Trazabilidad & control", color: "#cf8fd6" },
  admin:    { name: "Administración & continuidad", color: "#d8836b" },
};

const BASE = [
  { id:"J1", cat:"juridico", t:"Asociación Civil constituida (IGJ / CABA)", ci:2782, cm:0, tipo:"fijo", conf:"media",
    nota:"≈ ARS 4.000.000: escribano + gestoría/abogado + tasas IGJ + patrimonio inicial. Incluye además inscribir la ONG en el Registro Nacional de OSC de Salud y dar el alta como ONG en REPROCANN (sin costo). Las asoc. civiles NO pagan tasa anual IGJ." },
  { id:"J2", cat:"juridico", t:"Antecedentes penales de la Comisión Directiva", ci:0, cm:0, tipo:"fijo", conf:"alta",
    nota:"Certificado de Antecedentes Penales digital GRATIS vía Mi Argentina, por cada miembro de la CD. Ninguno puede tener condena firme por Ley 23.737." },
  { id:"J3", cat:"juridico", t:"Registro de Sustancias Sujetas a Control Especial (ANMAT)", ci:1739, cm:0, tipo:"fijo", conf:"baja",
    nota:"ESTIMACIÓN ≈ ARS 2.500.000. ANMAT subió aranceles 50% en 2025; no hay arancel específico publicado para ONG cannábicas. Pedir cotización directa." },

  { id:"M1", cat:"medico", t:"Director médico (médico · REFEPS + dipl. cannabis)", ci:0, cm:1252, tipo:"fijo", conf:"media",
    nota:"≈ ARS 1,2-2,4M/mes (10-20 h × hora médica ~$120.000) = USD 800-1.700. DEBE ser médico, con REFEPS + diplomatura (ej. CECANN-UBA) + firma digital. Responde solidariamente con el prescriptor y presenta informes semestrales." },
  { id:"M2", cat:"medico", t:"Indicación médica por socio (prescriptor)", ci:0, cm:4, tipo:"porSocio", conf:"media",
    nota:"≈ ARS 5-7k por socio/mes (prorrateo de consulta anual $60-100k). ESCALA con la cantidad de socios: a 150 ≈ USD 600/mes. El prescriptor debe tener diplomatura en cannabis y estar en REFEPS." },
  { id:"M3", cat:"medico", t:"Gestión confidencial de info médica", ci:0, cm:28, tipo:"fijo", conf:"baja",
    nota:"≈ ARS 40.000/mes (SaaS). Alternativa $0: SISA (obligatorio igual). Debe cumplir Ley 25.326 de Datos Personales." },

  { id:"C1", cat:"cultivo", t:"Domicilio de cultivo (alquiler)", ci:0, cm:2000, tipo:"fijo", conf:"media",
    nota:"Galpón 200-300 m² en GBA ≈ USD 2.000/mes; CABA 3.000-5.000. Se cotiza en USD → riesgo cambiario. Máx. 3 sedes; el cultivo funcional real es ~100-120 m²." },
  { id:"C2", cat:"cultivo", t:"Infraestructura indoor (modelo rotativo ~120 m²)", ci:45202, cm:0, tipo:"fijo", conf:"media",
    nota:"≈ ARS 50-80M para un indoor funcional de ~100-120 m² con sistema ROTATIVO (~200 plantas en flor/ciclo, NO el máximo teórico de 1.350). No conviene construir al máximo legal. Se reduce fuerte con cultivo mixto (ver comparador)." },
  { id:"C3", cat:"cultivo", t:"Genética / variedades registradas (RNC)", ci:1043, cm:139, tipo:"fijo", conf:"media",
    nota:"INASE VIGENTE (Dto 462 derogado por el 627/2025). Comprar variedades RNC (CAT3, EVA…) a operadores del RNCyFS y clonar internamente con trazabilidad. Zona gris sólo en inscripción de NUEVAS variedades. Convenio con universidad/INTA/CONICET abarata este ítem." },
  { id:"C4", cat:"cultivo", t:"Insumos + energía eléctrica / mes", ci:0, cm:3268, tipo:"fijo", conf:"media",
    nota:"≈ ARS 4,6M/mes. Electricidad ~21.000 kWh/mes (~ARS 4,2M) = 60-65% del OPEX + sustrato/nutrientes/mantenimiento. LED eficiente o cultivo mixto la baja 40-60%. Es el mayor costo recurrente." },

  { id:"K1", cat:"control", t:"Cromatografía por lote (laboratorio)", ci:0, cm:101, tipo:"fijo", conf:"alta",
    nota:"≈ ARS 145.000/mes (prorrateo de ~7 muestras × $62.000 por cosecha trimestral). Obligatorio. Labs: LCCM-UNL, CECANNUBA-UBA, CONICET-ENyS. Convenio con universidad lo abarata." },
  { id:"K2", cat:"control", t:"Trazabilidad / registro de producción", ci:348, cm:56, tipo:"fijo", conf:"baja",
    nota:"Setup ≈ ARS 500.000 + ARS 80.000/mes. No hay SaaS cannábico dominante en AR. Alternativa $0: Sheets/SISA. El plan de cultivo lo firma el Responsable Técnico." },
  { id:"K3", cat:"control", t:"Seguridad física", ci:2434, cm:104, tipo:"fijo", conf:"media",
    nota:"Inicial ≈ ARS 3,5M (cámaras HD + control de acceso biométrico + instalación) + ARS 150.000/mes. NO publicar ubicación de salas, nº de plantas ni datos de pacientes (registro reservado)." },

  { id:"A1", cat:"admin", t:"Gestión de socios / nómina", ci:0, cm:42, tipo:"fijo", conf:"baja",
    nota:"≈ ARS 60.000/mes. Arrancable con herramientas gratis; se presupuesta una solución mínima ordenada." },
  { id:"A2", cat:"admin", t:"Contador (balance + certificado de vigencia)", ci:0, cm:70, tipo:"fijo", conf:"alta",
    nota:"≈ ARS 100.000/mes: balance + IGJ + ARCA + certificado de vigencia anual. Tramitar exención de Ganancias e IVA ante ARCA antes de operar." },

  { id:"RT1", cat:"cultivo", t:"Responsable Técnico (agrónomo/biólogo)", ci:0, cm:750, tipo:"fijo", conf:"media", nuevo:true,
    nota:"ROL OBLIGATORIO de la 1780/2025, además del director médico: declara y FIRMA el Plan de Cultivo (genéticas, densidades, manejo). Debe ser profesional de producción agrícola o ciencia vegetal. Honorario de mercado USD 500-1.000/mes. Un farmacéutico o un cultivador sin título NO califican." },
];

const ALERTAS = [
  "INASE NO está disuelto: el Dto 462/2025 fue derogado por el Dto 627/2025 (sep-2025) y Diputados rechazó la disolución. Conseguir variedades RNC (CAT3, EVA) vía operadores del RNCyFS es viable.",
  "HABILITACIÓN = cuello de botella: ~250 clubes operan, pero solo ~51 estaban plenamente habilitados como persona jurídica (2024) y hay +1.000 en lista de espera. El módulo de carga de ONG se abrió recién en nov-2025. Prever demoras.",
  "NO cobrar 'por gramo': motivó el endurecimiento de la 1780 y un fiscal puede encuadrarlo en la Ley 23.737. La cuota es aporte societario / reembolso de costos. Cuota de mercado: USD 38-70/mes.",
  "CAPITAL REAL: la inversión inicial ronda USD 35-55k (infra indoor), muy por encima de la idea original de 6-10k. Es el principal obstáculo financiero.",
  "PALANCA CLAVE: el indoor puro es carísimo (luz = 60-65% del OPEX). Mixto indoor/outdoor + convenios con universidad/CONICET/municipio (Verdesco, Ciencia Sativa, 4 Almas) bajan costos de energía, genética y análisis.",
  "ROLES: director médico (médico) Y responsable técnico (agrónomo) son obligatorios y distintos; un farmacéutico no cubre ninguno. El permiso ONG dura 1 año y NO se renueva automáticamente.",
];

const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");

export default function ClubCannabicoPlannerV3() {
  const [items, setItems] = useState(BASE.map((b) => ({ ...b, got: false })));
  const [cuota, setCuota] = useState(35);
  const [socios, setSocios] = useState(80);
  const [open, setOpen] = useState({});

  const toggle = (id) => setItems((p) => p.map((i) => (i.id === id ? { ...i, got: !i.got } : i)));
  const setCost = (id, k, v) => setItems((p) => p.map((i) => (i.id === id ? { ...i, [k]: Math.max(0, Number(v) || 0) } : i)));
  const toggleOpen = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }));
  const reset = () => { setItems(BASE.map((b) => ({ ...b, got: false }))); setCuota(35); setSocios(80); setOpen({}); };

  const m = useMemo(() => {
    const inicialFaltante = items.filter((i) => !i.got).reduce((s, i) => s + i.ci, 0);
    const inicialTotal = items.reduce((s, i) => s + i.ci, 0);
    const fijoMensual = items.filter((i) => i.tipo === "fijo").reduce((s, i) => s + i.cm, 0);
    const porSocio = items.filter((i) => i.tipo === "porSocio").reduce((s, i) => s + i.cm, 0);
    const mensualTotal = fijoMensual + porSocio * socios;
    const ingresos = cuota * socios;
    const resultado = ingresos - mensualTotal;
    const contrib = cuota - porSocio;
    const beRaw = contrib > 0 ? Math.ceil(fijoMensual / contrib) : Infinity;
    const beViable = beRaw <= 150;
    const meses = resultado > 0 ? inicialTotal / resultado : Infinity;
    const completos = items.filter((i) => i.got).length;
    const pct = Math.round((completos / items.length) * 100);
    // Escenario mixto: C2 (CAPEX) -40%, C4 (energía) -50%
    const c2 = (items.find((i) => i.id === "C2") || {}).ci || 0;
    const c4 = (items.find((i) => i.id === "C4") || {}).cm || 0;
    const mixInicial = inicialTotal - c2 * 0.4;
    const mixMensual = mensualTotal - c4 * 0.5;
    const mixResultado = ingresos - mixMensual;
    return { inicialFaltante, inicialTotal, fijoMensual, porSocio, mensualTotal, ingresos, resultado,
             beRaw, beViable, meses, completos, pct, mixInicial, mixMensual, mixResultado };
  }, [items, cuota, socios]);

  const C = { bg:"#0c1110", panel:"#141d18", panel2:"#1a261e", line:"#2a3a30",
    text:"#e9efe8", muted:"#8ea394", accent:"#7dd181", amber:"#d8a64a", danger:"#e2725b", blue:"#6fb7e0" };
  const confColor = { alta: C.accent, media: C.amber, baja: C.danger };
  const confLabel = { alta: "dato firme", media: "media", baja: "estimación" };

  const KPI = ({ label, value, sub, color }) => (
    <div style={{ flex:"1 1 150px", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px" }}>
      <div style={{ fontSize:11, letterSpacing:1, textTransform:"uppercase", color:C.muted, fontFamily:"'Spline Sans Mono', monospace" }}>{label}</div>
      <div style={{ fontSize:25, fontWeight:700, color:color||C.text, fontFamily:"'Spline Sans Mono', monospace", marginTop:4, lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{sub}</div>}
    </div>
  );
  const Cmp = ({ label, v1, v2, color }) => (
    <div style={{ flex:"1 1 150px", background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"11px 14px" }}>
      <div style={{ fontSize:10.5, letterSpacing:.5, textTransform:"uppercase", color:C.muted, fontFamily:"'Spline Sans Mono', monospace" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:7, marginTop:5, fontFamily:"'Spline Sans Mono', monospace", flexWrap:"wrap" }}>
        <span style={{ fontSize:13, color:C.muted, textDecoration:"line-through" }}>{v1}</span>
        <span style={{ color:C.muted }}>→</span>
        <span style={{ fontSize:18, fontWeight:700, color }}>{v2}</span>
      </div>
    </div>
  );

  const cats = Object.keys(CATS);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Spline Sans', system-ui, sans-serif", padding:"20px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Spline+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;}
        input[type=range]{-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;background:#2a3a30;outline:none;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#7dd181;cursor:pointer;border:3px solid #0c1110;box-shadow:0 0 0 1px #7dd181;}
        input[type=range]::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#7dd181;cursor:pointer;border:3px solid #0c1110;}
        .num{background:#0c1110;border:1px solid #2a3a30;color:#e9efe8;border-radius:8px;padding:5px 8px;width:82px;font-family:'Spline Sans Mono',monospace;font-size:13px;}
        .num:focus{outline:none;border-color:#7dd181;}
        .row{transition:background .15s ease;} .row:hover{background:#1a261e;}
        @keyframes fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
      `}</style>

      <div style={{ maxWidth:880, margin:"0 auto", animation:"fade .5s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:C.accent, fontFamily:"'Spline Sans Mono', monospace" }}>Plan de viabilidad · v3 · datos completos</div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:30, fontWeight:800, margin:"4px 0 0", lineHeight:1.05 }}>Club Cannábico · Asociación Civil</h1>
            <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>Perplexity (prompts 1-5) · jun 2026 · TC ARS 1.438/USD</div>
          </div>
          <button onClick={reset} style={{ background:"transparent", border:`1px solid ${C.line}`, color:C.muted, borderRadius:10, padding:"8px 14px", cursor:"pointer", fontSize:12, fontFamily:"'Spline Sans Mono', monospace" }}>↺ Reiniciar</button>
        </div>

        {/* Comparación v1 → v3 */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
          <Cmp label="Inversión inicial" v1={money(V1.ci)} v2={money(m.inicialTotal)} color={C.amber} />
          <Cmp label="Operativo / mes (actual)" v1={money(V1.cm)} v2={money(m.mensualTotal)} color={C.danger} />
          <Cmp label="Socios break-even" v1={V1.be} v2={m.beViable ? m.beRaw : `${m.beRaw === Infinity ? "—" : m.beRaw} ⚠`} color={m.beViable ? C.accent : C.danger} />
        </div>

        {/* Progress */}
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:16, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:8 }}>
            <span style={{ color:C.muted }}>Requisitos que ya tenemos</span>
            <span style={{ fontFamily:"'Spline Sans Mono', monospace", color:C.accent }}>{m.completos}/{items.length} · {m.pct}%</span>
          </div>
          <div style={{ height:10, background:"#0c1110", borderRadius:8, overflow:"hidden", border:`1px solid ${C.line}` }}>
            <div style={{ width:`${m.pct}%`, height:"100%", background:"linear-gradient(90deg,#5bbf6e,#7dd181)", transition:"width .3s ease" }} />
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:8 }}>
          <KPI label="Inicial faltante" value={money(m.inicialFaltante)} sub={`de ${money(m.inicialTotal)} totales`} color={C.amber} />
          <KPI label="Costo operativo / mes" value={money(m.mensualTotal)} sub={`fijo ${money(m.fijoMensual)} + ${money(m.porSocio)}/socio`} color={C.danger} />
          <KPI label="Socios break-even" value={m.beRaw === Infinity ? "—" : m.beRaw} sub={m.beViable ? `a cuota ${money(cuota)}` : "supera el tope de 150 ⚠"} color={m.beViable ? C.accent : C.danger} />
        </div>
        <div style={{ fontSize:11.5, color:C.muted, marginBottom:18, fontFamily:"'Spline Sans Mono', monospace" }}>
          Tocá el ⓘ de cada ítem para fuente y nota. Costos editables.
        </div>

        {/* Comparador de escenarios */}
        <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:16, marginBottom:22 }}>
          <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:700, fontSize:15, marginBottom:3 }}>Escenario de cultivo</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>Estimación: el mixto indoor/outdoor recorta CAPEX de infra (C2) −40% y energía (C4) −50%.</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 160px", background:"#0c1110", border:`1px solid ${C.line}`, borderRadius:11, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:C.danger, fontFamily:"'Spline Sans Mono', monospace", textTransform:"uppercase" }}>Indoor puro</div>
              <div style={{ fontSize:12.5, color:C.muted, marginTop:6 }}>Inicial <b style={{ color:C.text }}>{money(m.inicialTotal)}</b></div>
              <div style={{ fontSize:12.5, color:C.muted }}>Mensual <b style={{ color:C.text }}>{money(m.mensualTotal)}</b></div>
              <div style={{ fontSize:12.5, color:C.muted }}>Resultado/mes <b style={{ color: m.resultado>=0?C.accent:C.danger }}>{(m.resultado>=0?"+":"−")+money(Math.abs(m.resultado))}</b></div>
            </div>
            <div style={{ flex:"1 1 160px", background:"#0c1110", border:`1px solid ${C.accent}`, borderRadius:11, padding:"12px 14px" }}>
              <div style={{ fontSize:11, color:C.accent, fontFamily:"'Spline Sans Mono', monospace", textTransform:"uppercase" }}>Mixto (estimado)</div>
              <div style={{ fontSize:12.5, color:C.muted, marginTop:6 }}>Inicial <b style={{ color:C.text }}>{money(m.mixInicial)}</b></div>
              <div style={{ fontSize:12.5, color:C.muted }}>Mensual <b style={{ color:C.text }}>{money(m.mixMensual)}</b></div>
              <div style={{ fontSize:12.5, color:C.muted }}>Resultado/mes <b style={{ color: m.mixResultado>=0?C.accent:C.danger }}>{(m.mixResultado>=0?"+":"−")+money(Math.abs(m.mixResultado))}</b></div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        {cats.map((cat) => {
          const list = items.filter((i) => i.cat === cat);
          return (
            <div key={cat} style={{ marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ width:9, height:9, borderRadius:3, background:CATS[cat].color }} />
                <span style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:700, fontSize:16 }}>{CATS[cat].name}</span>
              </div>
              <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, overflow:"hidden" }}>
                {list.map((i, idx) => (
                  <div key={i.id} className="row" style={{ padding:"13px 14px", borderTop: idx ? `1px solid ${C.line}` : "none" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                      <button onClick={() => toggle(i.id)} aria-label="toggle" style={{ flexShrink:0, marginTop:2, width:24, height:24, borderRadius:7, cursor:"pointer", border:`2px solid ${i.got ? C.accent : C.line}`, background: i.got ? C.accent : "transparent", color:"#0c1110", fontWeight:800, fontSize:14, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>{i.got ? "✓" : ""}</button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <span style={{ fontWeight:600, fontSize:14, color: i.got ? C.muted : C.text, textDecoration: i.got ? "line-through" : "none" }}>{i.t}</span>
                          {i.nuevo && <span style={{ fontSize:10, fontFamily:"'Spline Sans Mono', monospace", color:"#0c1110", background:C.accent, borderRadius:5, padding:"1px 6px", fontWeight:700 }}>NUEVO</span>}
                          <span title={confLabel[i.conf]} style={{ width:8, height:8, borderRadius:"50%", background:confColor[i.conf] }} />
                          <button onClick={() => toggleOpen(i.id)} style={{ background:"transparent", border:`1px solid ${C.line}`, color:C.muted, width:20, height:20, borderRadius:"50%", cursor:"pointer", fontSize:11, lineHeight:1, padding:0 }}>i</button>
                        </div>
                        <div style={{ display:"flex", gap:14, marginTop:9, flexWrap:"wrap", alignItems:"center" }}>
                          <label style={{ fontSize:11, color:C.muted, display:"flex", alignItems:"center", gap:6, fontFamily:"'Spline Sans Mono', monospace" }}>
                            Inicial USD
                            <input className="num" type="number" value={i.ci} onChange={(e) => setCost(i.id, "ci", e.target.value)} />
                          </label>
                          <label style={{ fontSize:11, color: i.tipo === "porSocio" ? C.blue : C.muted, display:"flex", alignItems:"center", gap:6, fontFamily:"'Spline Sans Mono', monospace" }}>
                            {i.tipo === "porSocio" ? "USD / socio" : "Mensual USD"}
                            <input className="num" type="number" value={i.cm} onChange={(e) => setCost(i.id, "cm", e.target.value)} />
                          </label>
                        </div>
                        {open[i.id] && (
                          <div style={{ marginTop:10, fontSize:12.5, color:C.muted, lineHeight:1.5, background:"#0c1110", border:`1px solid ${C.line}`, borderRadius:9, padding:"9px 11px" }}>
                            <span style={{ color:confColor[i.conf], fontFamily:"'Spline Sans Mono', monospace", fontSize:10.5, textTransform:"uppercase" }}>Confianza: {confLabel[i.conf]}</span>
                            <div style={{ marginTop:5 }}>{i.nota}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Modelo de socios */}
        <div style={{ marginTop:26, marginBottom:18 }}>
          <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:800, fontSize:19, marginBottom:4 }}>Modelo de socios</div>
          <div style={{ color:C.muted, fontSize:13, marginBottom:14 }}>Cuota de mercado real: USD 38-70/mes. La indicación médica (M2) escala por socio.</div>
          <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
              <span style={{ color:C.muted }}>Cuota mensual por socio</span>
              <span style={{ fontFamily:"'Spline Sans Mono', monospace", color:C.accent }}>{money(cuota)}</span>
            </div>
            <input type="range" min={5} max={120} step={5} value={cuota} onChange={(e) => setCuota(Number(e.target.value))} style={{ width:"100%" }} />
            <div style={{ display:"flex", justifyContent:"space-between", margin:"18px 0 6px", fontSize:13 }}>
              <span style={{ color:C.muted }}>Cantidad de socios</span>
              <span style={{ fontFamily:"'Spline Sans Mono', monospace", color: socios >= 150 ? C.amber : C.accent }}>{socios}{socios >= 150 ? " (tope legal)" : ""}</span>
            </div>
            <input type="range" min={0} max={150} step={1} value={socios} onChange={(e) => setSocios(Number(e.target.value))} style={{ width:"100%" }} />
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:20 }}>
              <KPI label="Ingresos / mes" value={money(m.ingresos)} color={C.accent} />
              <KPI label="Resultado / mes" value={(m.resultado >= 0 ? "+" : "−") + money(Math.abs(m.resultado))} color={m.resultado >= 0 ? C.accent : C.danger} sub={m.resultado >= 0 ? "superávit" : "déficit"} />
              <KPI label="Recupero inicial" value={m.meses === Infinity ? "—" : m.meses.toFixed(1) + " m"} sub={m.meses === Infinity ? "no se recupera" : "para cubrir lo inicial"} color={C.amber} />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div style={{ background:"#1d1410", border:"1px solid #4a2f1e", borderRadius:14, padding:16, marginBottom:18 }}>
          <div style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontWeight:700, fontSize:15, color:C.amber, marginBottom:10 }}>⚠ Alertas para la reunión</div>
          {ALERTAS.map((a, k) => (
            <div key={k} style={{ display:"flex", gap:9, fontSize:13, color:"#e7d3b8", marginTop: k ? 8 : 0, lineHeight:1.45 }}>
              <span style={{ color:C.amber }}>›</span><span>{a}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize:11.5, color:C.muted, lineHeight:1.5, fontFamily:"'Spline Sans Mono', monospace" }}>
          Costos en USD validados vía Perplexity (prompts 1-5, jun 2026). Confianza: verde = firme, ámbar = media, rojo = estimación. No es asesoramiento legal ni contable; verificar con escribano, contador y abogado cannábico.
        </div>
      </div>
    </div>
  );
}

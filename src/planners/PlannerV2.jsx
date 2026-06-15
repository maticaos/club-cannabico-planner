import React, { useState, useMemo } from "react";

// ════════════════════════════════════════════════════════════════
//  CLUB CANNÁBICO · PLANNER v2 — datos validados (Perplexity, jun 2026)
//  TC referencia: ARS 1.438 / USD · Marco: Res. 1780/2025 · Ley 27.350
// ════════════════════════════════════════════════════════════════

// Totales de la v1 (estimados) para comparar
const V1 = { ci: 4710, cm: 1595, be: 46 };

const CATS = {
  juridico: { name: "Constitución & legal", color: "#7dd181" },
  medico:   { name: "Médico & pacientes",   color: "#6fb7e0" },
  cultivo:  { name: "Cultivo & producción", color: "#c8a85a" },
  control:  { name: "Trazabilidad & control", color: "#cf8fd6" },
  admin:    { name: "Administración & continuidad", color: "#d8836b" },
};

// tipo: "fijo" = costo mensual fijo | "porSocio" = costo mensual por cada socio
// conf: confianza del dato (alta / media / baja) · nuevo: ítem que no estaba en v1
const BASE = [
  { id:"J1", cat:"juridico", t:"Asociación Civil constituida (IGJ / CABA)", ci:2782, cm:0, tipo:"fijo", conf:"media",
    nota:"≈ ARS 4.000.000: escribano ~2M + gestoría/abogado ~1,5M + tasas IGJ + patrimonio inicial (3 SMVM). Las asoc. civiles NO pagan tasa anual IGJ. Fuente: IGJ CABA / portalsocietario." },
  { id:"J2", cat:"juridico", t:"Antecedentes penales de la Comisión Directiva", ci:0, cm:0, tipo:"fijo", conf:"alta",
    nota:"El Certificado de Antecedentes Penales digital es GRATIS vía Mi Argentina (~5 personas de la CD). Fuente: Registro Nacional de Reincidencia." },
  { id:"J3", cat:"juridico", t:"Registro de Sustancias Sujetas a Control Especial (ANMAT)", ci:1739, cm:0, tipo:"fijo", conf:"baja",
    nota:"ESTIMACIÓN ≈ ARS 2.500.000. ANMAT subió aranceles 50% en 2025; no hay arancel específico publicado para ONG cannábicas. Pedir cotización directa a ANMAT." },

  { id:"M1", cat:"medico", t:"Director médico (médico · REFEPS + dipl. cannabis)", ci:0, cm:1252, tipo:"fijo", conf:"media",
    nota:"≈ ARS 1.800.000/mes (15 h × hora médica $120.000, CPBA dic-2025). DEBE ser médico: presenta informe semestral de pacientes y se responsabiliza solidariamente con el prescriptor. No confundir con el Responsable Técnico." },
  { id:"M2", cat:"medico", t:"Indicación médica por socio (prescriptor)", ci:0, cm:3, tipo:"porSocio", conf:"baja",
    nota:"≈ ARS 5.000 por socio/mes (prorrateo de ~$60.000/año). ESCALA con la cantidad de socios: a 150 ≈ USD 521/mes. El médico debe tener diplomatura en cannabis y estar en REFEPS." },
  { id:"M3", cat:"medico", t:"Gestión confidencial de info médica", ci:0, cm:28, tipo:"fijo", conf:"baja",
    nota:"≈ ARS 40.000/mes (SaaS). Alternativa $0: SISA (obligatorio igual para REPROCANN). Debe cumplir Ley 25.326 de Datos Personales." },

  { id:"C1", cat:"cultivo", t:"Domicilio de cultivo (alquiler)", ci:0, cm:2000, tipo:"fijo", conf:"media",
    nota:"Galpón 200-300 m² en GBA ≈ USD 2.000/mes; CABA USD 3.000-5.000. Se cotiza en USD → riesgo cambiario. Máx. 3 sedes; ~6 m² indoor por paciente. Fuente: Zonaprop jun-2026." },
  { id:"C2", cat:"cultivo", t:"Infraestructura indoor (hasta 150 pacientes)", ci:45202, cm:0, tipo:"fijo", conf:"media",
    nota:"≈ ARS 65.000.000: ~20 salas rotativas + obra eléctrica trifásica + climatización + extracción. SE REDUCE FUERTE con cultivo mixto indoor/outdoor. Fuente: Ciclocultivo / Revista THC." },
  { id:"C3", cat:"cultivo", t:"Genética / variedades registradas ⚠", ci:1043, cm:139, tipo:"fijo", conf:"baja",
    nota:"Inicial ≈ ARS 1,5M (100 semillas) + reposición ≈ ARS 200.000/mes. Post-INASE en transición (Diputados rechazó el Dto 462/2025). Las ONG pueden usar esquejes propios de variedades declaradas." },
  { id:"C4", cat:"cultivo", t:"Insumos + energía eléctrica / mes", ci:0, cm:3268, tipo:"fijo", conf:"media",
    nota:"≈ ARS 4.700.000/mes. La ELECTRICIDAD es el 60-65% del OPEX (~$4,4M). LED eficiente o cultivo mixto la baja 40-60%. Es el mayor costo recurrente del proyecto." },

  { id:"K1", cat:"control", t:"Cromatografía por lote (laboratorio)", ci:0, cm:101, tipo:"fijo", conf:"alta",
    nota:"≈ ARS 145.000/mes (prorrateo de ~7 muestras × $62.000 por cosecha trimestral). Obligatorio para trazabilidad. Labs: LCCM-UNL, CECANNUBA-UBA, CONICET-ENyS." },
  { id:"K2", cat:"control", t:"Trazabilidad / registro de producción", ci:348, cm:56, tipo:"fijo", conf:"baja",
    nota:"Setup ≈ ARS 500.000 + ARS 80.000/mes. NO hay SaaS cannábico dominante en AR. Alternativa $0: Sheets/SISA para el mínimo normativo. Confirmar requisito exacto con REPROCANN." },
  { id:"K3", cat:"control", t:"Seguridad física", ci:2434, cm:104, tipo:"fijo", conf:"media",
    nota:"Inicial ≈ ARS 3.500.000 (2 kits de cámaras HD + control de acceso biométrico + instalación) + ARS 150.000/mes de mantenimiento/monitoreo. Implícito por ser sustancia controlada." },

  { id:"A1", cat:"admin", t:"Gestión de socios / nómina", ci:0, cm:42, tipo:"fijo", conf:"baja",
    nota:"≈ ARS 60.000/mes. Arrancable con herramientas gratis; se presupuesta una solución ordenada mínima." },
  { id:"A2", cat:"admin", t:"Contador (balance + certificado de vigencia)", ci:0, cm:70, tipo:"fijo", conf:"alta",
    nota:"≈ ARS 100.000/mes: balance + presentación IGJ + ARCA + certificado de vigencia anual. Cat. I (ingresos bajos) puede ser menor. Fuente: CPCE CABA jun-2026." },

  { id:"RT1", cat:"cultivo", t:"Responsable Técnico (agrónomo/ing. agrónomo)", ci:0, cm:1000, tipo:"fijo", conf:"baja", nuevo:true,
    nota:"ROL OBLIGATORIO de la Res. 1780/2025, ADEMÁS del director médico: declara el plan de cultivo y debe ser profesional de producción agrícola o ciencia vegetal. Faltaba en la v1. Valor ESTIMADO — validar con el Prompt 4." },
];

const ALERTAS = [
  "VIABILIDAD: con la infra indoor para 150 pacientes, el proyecto queda operativamente en déficit a cuotas típicas. El break-even real exige cuota alta y/o bajar costos (cultivo mixto, sede más barata).",
  "ELECTRICIDAD: el costo eléctrico del indoor puede superar ARS 4.000.000/mes (~USD 2.800). LED de alta eficiencia o indoor+outdoor estacional lo reduce 40-60%.",
  "EXENCIÓN IMPOSITIVA: tramitar exención de Ganancias e IVA ante ARCA (ex-AFIP) ANTES de operar — es condición de viabilidad económica.",
  "DECRETO 462/2025: disolvió ARICCAME e INASE; Diputados lo rechazó (ago-2025). Normas en tensión: monitorear Boletín Oficial y consultar abogado cannábico.",
  "ROLES (1780/2025): se exigen DOS profesionales distintos — director médico (médico) y responsable técnico (agrónomo). Un farmacéutico no cubre ninguno de los dos.",
];

const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");

export default function ClubCannabicoPlannerV2() {
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
    return { inicialFaltante, inicialTotal, fijoMensual, porSocio, mensualTotal, ingresos, resultado, beRaw, beViable, meses, completos, pct };
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
        .row{transition:background .15s ease;}
        .row:hover{background:#1a261e;}
        @keyframes fade{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
      `}</style>

      <div style={{ maxWidth:880, margin:"0 auto", animation:"fade .5s ease" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:2, textTransform:"uppercase", color:C.accent, fontFamily:"'Spline Sans Mono', monospace" }}>Plan de viabilidad · v2 · datos reales</div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque', sans-serif", fontSize:30, fontWeight:800, margin:"4px 0 0", lineHeight:1.05 }}>Club Cannábico · Asociación Civil</h1>
            <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>Validado con Perplexity · jun 2026 · TC ARS 1.438/USD</div>
          </div>
          <button onClick={reset} style={{ background:"transparent", border:`1px solid ${C.line}`, color:C.muted, borderRadius:10, padding:"8px 14px", cursor:"pointer", fontSize:12, fontFamily:"'Spline Sans Mono', monospace" }}>↺ Reiniciar</button>
        </div>

        {/* Comparación v1 → v2 */}
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
        <div style={{ fontSize:11.5, color:C.muted, marginBottom:20, fontFamily:"'Spline Sans Mono', monospace" }}>
          Tocá el ⓘ de cada ítem para ver fuente y nota. Los costos son editables.
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
          <div style={{ color:C.muted, fontSize:13, marginBottom:14 }}>La indicación médica (M2) escala por socio, así que el resultado cambia distinto que en la v1.</div>

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
          Costos en USD validados vía Perplexity (jun 2026). Confianza por ítem: verde = dato firme, ámbar = media, rojo = estimación. No es asesoramiento legal ni contable. Fuentes en cada nota; verificar con escribano, contador y abogado cannábico antes de operar.
        </div>
      </div>
    </div>
  );
}

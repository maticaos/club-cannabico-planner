import React, { useState, useMemo } from "react";

// ── Datos base ───────────────────────────────────────────────
// Requisitos derivados de Resolución 1780/2025 (REPROCANN, personas jurídicas)
// + constitución de Asociación Civil (IGJ/CABA). Costos en USD ESTIMADOS y EDITABLES.
const CATS = {
  juridico: { name: "Constitución & legal", color: "#7dd181" },
  medico:   { name: "Médico & pacientes",   color: "#6fb7e0" },
  cultivo:  { name: "Cultivo & producción", color: "#c8a85a" },
  control:  { name: "Trazabilidad & control", color: "#cf8fd6" },
  admin:    { name: "Administración & continuidad", color: "#d8836b" },
};

const BASE = [
  { id: "J1", cat: "juridico", t: "Asociación Civil constituida e inscripta (IGJ / CABA)", d: "Estatuto, acta constitutiva y personería jurídica vigente. Requisito base para inscribir la persona jurídica en REPROCANN.", ci: 600, cm: 0 },
  { id: "J2", cat: "juridico", t: "Antecedentes penales de la Comisión Directiva", d: "Ningún miembro de los órganos de administración/fiscalización con condena firme por Ley 23.737 (estupefacientes).", ci: 40, cm: 0 },
  { id: "J3", cat: "juridico", t: "Inscripción en Registro de Sustancias Sujetas a Control Especial", d: "Trámite previo exigido a las personas jurídicas para operar.", ci: 100, cm: 0 },

  { id: "M1", cat: "medico", t: "Director médico designado", d: "Con formación específica en cannabis e inscripto en REFEPS. Supervisa el circuito médico. Honorario mensual.", ci: 0, cm: 400 },
  { id: "M2", cat: "medico", t: "Médicos prescriptores / indicaciones por socio", d: "Indicación médica válida (Art. 7) para cada usuario inscripto. Vínculo con profesionales habilitados.", ci: 0, cm: 150 },
  { id: "M3", cat: "medico", t: "Gestión confidencial de información médica", d: "Registros aptos para garantizar confidencialidad y manejo adecuado de datos clínicos.", ci: 120, cm: 20 },

  { id: "C1", cat: "cultivo", t: "Domicilio de cultivo declarado (Art. 13)", d: "Espacio físico declarado y notificado. Acá va alquiler / costo del lugar de cultivo.", ci: 0, cm: 300 },
  { id: "C2", cat: "cultivo", t: "Infraestructura indoor", d: "Sala, iluminación, control de clima, extracción, seguridad del cultivo.", ci: 3000, cm: 0 },
  { id: "C3", cat: "cultivo", t: "Genética / variedades registradas ⚠", d: "1780/2025 exige variedad registrada. OJO: INASE fue disuelto (Dto 462/2025); la función pasó a Agricultura y hoy está en zona gris. Validar disponibilidad real.", ci: 200, cm: 0 },
  { id: "C4", cat: "cultivo", t: "Insumos de cultivo", d: "Sustrato, nutrientes, energía eléctrica y consumibles por ciclo.", ci: 0, cm: 250 },

  { id: "K1", cat: "control", t: "Informe cromatográfico por lote", d: "Análisis de laboratorio por cada lote producido (declaración jurada semestral asociada).", ci: 0, cm: 250 },
  { id: "K2", cat: "control", t: "Sistema de trazabilidad / registro de producción", d: "Registro de plantas totales, en floración y variedad usada. Base de los informes semestrales.", ci: 150, cm: 30 },
  { id: "K3", cat: "control", t: "Seguridad física", d: "Cámaras, control de acceso y resguardo del cultivo y del producto.", ci: 500, cm: 20 },

  { id: "A1", cat: "admin", t: "Sistema de gestión de socios / nómina", d: "Nombre, DNI, domicilio, conformidad del usuario y renuncia a autocultivo u otra entidad. Máx. 150 socios por persona jurídica.", ci: 0, cm: 25 },
  { id: "A2", cat: "admin", t: "Contador / balances / certificado de vigencia anual", d: "La autorización dura solo 1 año: hay que renovar y presentar certificado de vigencia anualmente.", ci: 0, cm: 150 },
];

const ALERTAS = [
  "La autorización a personas jurídicas dura solo 1 año (vs. 3 años el autocultivo). Hay que renovar.",
  "Tope de 150 socios por entidad. Para más, aprobación específica del Ministerio de Salud.",
  "Plazo de 6 meses para adecuarse a la 1780/2025 o se da de baja la inscripción.",
  "ARICCAME e INASE fueron disueltos (Dto 462/2025). Funciones repartidas: ANMAT (flor/medicinal), Agricultura (variedades/semillas). Hay incertidumbre operativa.",
  "Informes semestrales en carácter de DDJJ + cromatografía por lote: es carga recurrente real.",
];

const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");

export default function ClubCannabicoPlanner() {
  const [items, setItems] = useState(
    BASE.map((b) => ({ ...b, got: false }))
  );
  const [cuota, setCuota] = useState(35);
  const [socios, setSocios] = useState(80);

  const toggle = (id) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, got: !i.got } : i)));
  const setCost = (id, k, v) =>
    setItems((p) =>
      p.map((i) => (i.id === id ? { ...i, [k]: Math.max(0, Number(v) || 0) } : i))
    );
  const reset = () => {
    setItems(BASE.map((b) => ({ ...b, got: false })));
    setCuota(35);
    setSocios(80);
  };

  const m = useMemo(() => {
    const faltan = items.filter((i) => !i.got);
    const inicialFaltante = faltan.reduce((s, i) => s + i.ci, 0);
    const inicialTotal = items.reduce((s, i) => s + i.ci, 0);
    const mensual = items.reduce((s, i) => s + i.cm, 0);
    const ingresos = cuota * socios;
    const resultado = ingresos - mensual;
    const breakeven = cuota > 0 ? Math.ceil(mensual / cuota) : 0;
    const meses = resultado > 0 ? inicialTotal / resultado : Infinity;
    const completos = items.filter((i) => i.got).length;
    const pct = Math.round((completos / items.length) * 100);
    return { faltan, inicialFaltante, inicialTotal, mensual, ingresos, resultado, breakeven, meses, completos, pct };
  }, [items, cuota, socios]);

  const cats = Object.keys(CATS);
  const C = {
    bg: "#0c1110", panel: "#141d18", panel2: "#1a261e", line: "#2a3a30",
    text: "#e9efe8", muted: "#8ea394", accent: "#7dd181", amber: "#d8a64a", danger: "#e2725b",
  };

  const KPI = ({ label, value, sub, color }) => (
    <div style={{ flex: "1 1 150px", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: C.muted, fontFamily: "'Spline Sans Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || C.text, fontFamily: "'Spline Sans Mono', monospace", marginTop: 4, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Spline Sans', system-ui, sans-serif", padding: "20px 16px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Spline+Sans:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input[type=range]{ -webkit-appearance:none; appearance:none; height:6px; border-radius:6px; background:#2a3a30; outline:none; }
        input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#7dd181; cursor:pointer; border:3px solid #0c1110; box-shadow:0 0 0 1px #7dd181; }
        input[type=range]::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:#7dd181; cursor:pointer; border:3px solid #0c1110; }
        .num{ background:#0c1110; border:1px solid #2a3a30; color:#e9efe8; border-radius:8px; padding:5px 8px; width:78px; font-family:'Spline Sans Mono',monospace; font-size:13px; }
        .num:focus{ outline:none; border-color:#7dd181; }
        .row{ transition: background .15s ease; }
        .row:hover{ background:#1a261e; }
        @keyframes fade { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto", animation: "fade .5s ease" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.accent, fontFamily: "'Spline Sans Mono', monospace" }}>Plan de viabilidad · Reunión ONG</div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 800, margin: "4px 0 0", lineHeight: 1.05 }}>Club Cannábico · Asociación Civil</h1>
            <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Marco: REPROCANN · Resolución 1780/2025 · Ley 27.350</div>
          </div>
          <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'Spline Sans Mono', monospace" }}>↺ Reiniciar</button>
        </div>

        {/* Progress */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: C.muted }}>Requisitos que ya tenemos</span>
            <span style={{ fontFamily: "'Spline Sans Mono', monospace", color: C.accent }}>{m.completos}/{items.length} · {m.pct}%</span>
          </div>
          <div style={{ height: 10, background: "#0c1110", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.line}` }}>
            <div style={{ width: `${m.pct}%`, height: "100%", background: `linear-gradient(90deg,#5bbf6e,#7dd181)`, transition: "width .3s ease" }} />
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
          <KPI label="Inversión inicial faltante" value={money(m.inicialFaltante)} sub={`de ${money(m.inicialTotal)} totales`} color={C.amber} />
          <KPI label="Costo operativo / mes" value={money(m.mensual)} sub="gastos recurrentes" color={C.danger} />
          <KPI label="Socios para break-even" value={m.breakeven} sub={`a cuota ${money(cuota)}`} color={C.accent} />
        </div>

        {/* Checklist */}
        {cats.map((cat) => {
          const list = items.filter((i) => i.cat === cat);
          return (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: CATS[cat].color }} />
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16 }}>{CATS[cat].name}</span>
              </div>
              <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
                {list.map((i, idx) => (
                  <div key={i.id} className="row" style={{ display: "flex", gap: 12, padding: "13px 14px", borderTop: idx ? `1px solid ${C.line}` : "none", alignItems: "flex-start" }}>
                    <button onClick={() => toggle(i.id)} aria-label="toggle" style={{ flexShrink: 0, marginTop: 2, width: 24, height: 24, borderRadius: 7, cursor: "pointer", border: `2px solid ${i.got ? C.accent : C.line}`, background: i.got ? C.accent : "transparent", color: "#0c1110", fontWeight: 800, fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>{i.got ? "✓" : ""}</button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: i.got ? C.muted : C.text, textDecoration: i.got ? "line-through" : "none" }}>{i.t}</div>
                      <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{i.d}</div>
                      <div style={{ display: "flex", gap: 14, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                        <label style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Spline Sans Mono', monospace" }}>
                          Inicial USD
                          <input className="num" type="number" value={i.ci} onChange={(e) => setCost(i.id, "ci", e.target.value)} />
                        </label>
                        <label style={{ fontSize: 11, color: C.muted, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Spline Sans Mono', monospace" }}>
                          Mensual USD
                          <input className="num" type="number" value={i.cm} onChange={(e) => setCost(i.id, "cm", e.target.value)} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Modelo de socios */}
        <div style={{ marginTop: 26, marginBottom: 18 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Modelo de socios</div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>Movés la cuota y la cantidad de socios para ver si el club se sostiene.</div>

          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: C.muted }}>Cuota mensual por socio</span>
              <span style={{ fontFamily: "'Spline Sans Mono', monospace", color: C.accent }}>{money(cuota)}</span>
            </div>
            <input type="range" min={5} max={120} step={5} value={cuota} onChange={(e) => setCuota(Number(e.target.value))} style={{ width: "100%" }} />

            <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 0 6px", fontSize: 13 }}>
              <span style={{ color: C.muted }}>Cantidad de socios</span>
              <span style={{ fontFamily: "'Spline Sans Mono', monospace", color: socios > 150 ? C.danger : C.accent }}>{socios} {socios >= 150 ? "(tope legal)" : ""}</span>
            </div>
            <input type="range" min={0} max={150} step={1} value={socios} onChange={(e) => setSocios(Number(e.target.value))} style={{ width: "100%" }} />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <KPI label="Ingresos / mes" value={money(m.ingresos)} color={C.accent} />
              <KPI label="Resultado / mes" value={(m.resultado >= 0 ? "+" : "−") + money(Math.abs(m.resultado))} color={m.resultado >= 0 ? C.accent : C.danger} sub={m.resultado >= 0 ? "superávit" : "déficit"} />
              <KPI label="Recupero inicial" value={m.meses === Infinity ? "—" : m.meses.toFixed(1) + " m"} sub={m.meses === Infinity ? "no se recupera" : "para cubrir lo inicial"} color={C.amber} />
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div style={{ background: "#1d1410", border: `1px solid #4a2f1e`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: C.amber, marginBottom: 10 }}>⚠ Alertas regulatorias para charlar en la reunión</div>
          {ALERTAS.map((a, k) => (
            <div key={k} style={{ display: "flex", gap: 9, fontSize: 13, color: "#e7d3b8", marginTop: k ? 8 : 0, lineHeight: 1.45 }}>
              <span style={{ color: C.amber }}>›</span><span>{a}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, fontFamily: "'Spline Sans Mono', monospace" }}>
          Costos en USD, estimados y editables — reemplazalos con presupuestos reales en la reunión. No es asesoramiento legal: el escribano/abogado y el director médico tienen la última palabra. Fuentes: Resolución 1780/2025 (Boletín Oficial), Decreto 462/2025.
        </div>
      </div>
    </div>
  );
}

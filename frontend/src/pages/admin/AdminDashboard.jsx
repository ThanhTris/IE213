import { useState } from "react";
import ProductList from "./ProductList";
import RepairHistory from "./RepairHistory";
import UserManagement from "./UserManagement";

// ─── MOCK DATA (replace with API data later) ──────────────────────────────────
const DEFAULT_METRICS = [
  {
    label: "Total Products",
    value: 5,
    trend: "+12%",
    up: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
  },
  {
    label: "Active Warranties",
    value: 5,
    trend: "+8%",
    up: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Total Repairs",
    value: 5,
    trend: "-5%",
    up: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    label: "Covered Repairs",
    value: 3,
    trend: "+15%",
    up: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

// Shape: [{ month: "Jan", value: 45 }, ...]
const DEFAULT_LINE_DATA = [
  { month: "Jan", value: 45 },
  { month: "Feb", value: 52 },
  { month: "Mar", value: 38 },
  { month: "Apr", value: 62 },
  { month: "May", value: 55 },
  { month: "Jun", value: 48 },
];

// Shape: [{ label: "Smartphones", pct: 41, color: "#1e3a8a" }, ...]
const DEFAULT_PIE_DATA = [
  { label: "Smartphones", pct: 41, color: "#1e3a8a" },
  { label: "Laptops",     pct: 25, color: "#3b82f6" },
  { label: "Tablets",     pct: 16, color: "#10b981" },
  { label: "Wearables",   pct: 11, color: "#f59e0b" },
  { label: "Audio",       pct:  7, color: "#ef4444" },
];

// Shape: [{ label: "Screen", value: 85 }, ...]
const DEFAULT_BAR_DATA = [
  { label: "Screen",   value: 85 },
  { label: "Battery",  value: 62 },
  { label: "Camera",   value: 34 },
  { label: "Keyboard", value: 28 },
  { label: "Other",    value: 46 },
];

// ─── SVG LINE CHART ───────────────────────────────────────────────────────────
// Props: data = [{ month: string, value: number }]
function LineChart({ data }) {
  if (!data || data.length < 2) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No data</p>;

  const W = 500, H = 220;
  const PAD = { t: 16, r: 24, b: 44, l: 44 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.value), 10);

  // Round max up to nearest 20
  const yMax = Math.ceil(maxVal / 20) * 20;
  const yTicks = [];
  for (let t = 0; t <= yMax; t += 20) yTicks.push(t);

  const xScale = (i) => PAD.l + (i / (data.length - 1)) * plotW;
  const yScale = (v) => PAD.t + plotH - (v / yMax) * plotH;

  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {/* Grid + Y labels */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} y1={yScale(t)} x2={W - PAD.r} y2={yScale(t)}
            stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PAD.l - 8} y={yScale(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{t}</text>
        </g>
      ))}

      {/* Line */}
      <polyline points={pts} fill="none" stroke="#1e40af" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="4.5"
          fill="white" stroke="#1e40af" strokeWidth="2.5" />
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={xScale(i)} y={H - PAD.b + 20}
          textAnchor="middle" fontSize="11" fill="#64748b">{d.month}</text>
      ))}

      {/* Legend */}
      <g transform={`translate(${W / 2 - 32}, ${H - 6})`}>
        <circle cx="5" cy="0" r="4" fill="white" stroke="#1e40af" strokeWidth="2" />
        <text x="14" y="4" fontSize="11" fill="#64748b">Repairs</text>
      </g>
    </svg>
  );
}

// ─── PIE CHART with sidebar legend (no floating labels) ───────────────────────
// Props: data = [{ label: string, pct: number, color: string }]
function PieChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No data</p>;

  const R = 80, CX = 100, CY = 100;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arc = (startDeg, endDeg) => {
    const x1 = CX + R * Math.cos(toRad(startDeg));
    const y1 = CY + R * Math.sin(toRad(startDeg));
    const x2 = CX + R * Math.cos(toRad(endDeg));
    const y2 = CY + R * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  // Build slices with a pure accumulation — no mutation
  const slices = data.reduce((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].endAngle : -90;
    const sweep = (d.pct / 100) * 360;
    return [...acc, { ...d, startAngle: prev, endAngle: prev + sweep }];
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* Pie */}
      <svg viewBox="0 0 200 200" style={{ width: 180, height: 180, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={arc(s.startAngle, s.endAngle)}
            fill={s.color} stroke="white" strokeWidth="2" />
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontSize: 13, color: s.color, fontWeight: 700, marginLeft: "auto", paddingLeft: 8 }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG BAR CHART ───────────────────────────────────────────────────────────
// Props: data = [{ label: string, value: number }]
function BarChart({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>No data</p>;

  const W = 660, H = 200;
  const PAD = { t: 12, r: 20, b: 40, l: 44 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const yMax = Math.ceil(maxVal / 25) * 25;
  const yTicks = [];
  for (let t = 0; t <= yMax; t += 25) yTicks.push(t);

  const barW = (plotW / data.length) * 0.55;
  const gap = plotW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {/* Y ticks */}
      {yTicks.map((t) => {
        const y = PAD.t + plotH - (t / yMax) * plotH;
        return (
          <g key={t}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">{t}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const bH = (d.value / yMax) * plotH;
        const x = PAD.l + i * gap + (gap - barW) / 2;
        const y = PAD.t + plotH - bH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bH} rx="6" fill="#10b981" />
            <text x={x + barW / 2} y={H - PAD.b + 18} textAnchor="middle" fontSize="12" fill="#64748b">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const tabs = [
  {
    id: "products",
    label: "Product List",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
  },
  {
    id: "repair-history",
    label: "Repair History",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: "user-management",
    label: "User Management",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
      </svg>
    ),
  },
];

// ─── MAIN ──────────────────────────────────────────────────────────────────────
// ─── MAIN ──────────────────────────────────────────────────────────────────────
// To use real API data, pass the following props:
//   metrics, lineData, pieData, barData
function AdminDashboard({
  metrics = DEFAULT_METRICS,
  lineData = DEFAULT_LINE_DATA,
  pieData = DEFAULT_PIE_DATA,
  barData = DEFAULT_BAR_DATA,
}) {
  const [activeTab, setActiveTab] = useState("products");

  const card = {
    background: "white",
    borderRadius: 14,
    padding: "20px 24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  return (
    <div className="admin-page-wrapper">
      {/* Page Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <p>Monitor products, warranties, and repair activities</p>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {metrics.map((m, i) => (
          <div key={i} style={card}>
            {/* Top row: icon + trend */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {m.icon}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: m.up ? "#10b981" : "#ef4444",
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  {m.up
                    ? <><polyline points="18 15 12 9 6 15" /></>
                    : <><polyline points="6 9 12 15 18 9" /></>
                  }
                </svg>
                {m.trend}
              </span>
            </div>
            {/* Label */}
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginBottom: 4 }}>{m.label}</div>
            {/* Value */}
            <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Line Chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Monthly Repair Trends</span>
          </div>
          <LineChart data={lineData} />
        </div>

        {/* Pie Chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Product Categories</span>
          </div>
          <PieChart data={pieData} />
        </div>
      </div>

      {/* ── Bar Chart (full width) ──────────────────────────────────────── */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Repair Types Distribution</span>
        </div>
        <BarChart data={barData} />
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="admin-tabs-container">
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div className="admin-content">
        {activeTab === "products" && <ProductList />}
        {activeTab === "repair-history" && <RepairHistory />}
        {activeTab === "user-management" && <UserManagement />}
      </div>
    </div>
  );
}

export default AdminDashboard;

import { useState, useEffect } from "react";
import ProductList from "./ProductList";
import RepairHistory from "./RepairHistory";
import UserManagement from "./UserManagement";
import { productService } from "../../services/productService";
import { warrantyService } from "../../services/warrantyService";
import { repairService } from "../../services/repairService";
import { Package, ShieldCheck, Wrench, CheckCircle, TrendingUp, TrendingDown, Activity, Check } from "lucide-react";


// ─── SVG LINE CHART ───────────────────────────────────────────────────────────
// ─── SVG LINE CHART ───────────────────────────────────────────────────────────
function LineChart({ data }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length < 2) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20, fontSize: "2rem", fontWeight: 800 }}>0</p>;

  const W = 500, H = 220;
  const PAD = { t: 25, r: 24, b: 44, l: 44 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  
  // Step 10 for better precision
  const step = 10;
  const yMax = Math.ceil(maxVal / step) * step;
  const yTicks = [];
  for (let t = 0; t <= yMax; t += step) yTicks.push(t);

  const xScale = (i) => PAD.l + (i / (data.length - 1)) * plotW;
  const yScale = (v) => PAD.t + plotH - (v / yMax) * plotH;
  const pts = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} y1={yScale(t)} x2={W - PAD.r} y2={yScale(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
            <text x={PAD.l - 8} y={yScale(t) + 4} textAnchor="end" fontSize="0.8rem" fontWeight="600" fill="#94a3b8">{t}</text>
          </g>
        ))}
        <polyline points={pts} fill="none" stroke="#1e40af" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => {
          const cx = xScale(i);
          const cy = yScale(d.value);
          const isHovered = hovered?.index === i;
          return (
            <g key={i}>
              <circle
                cx={cx} cy={cy} r={isHovered ? 7 : 4.5}
                fill="white" stroke="#1e40af" strokeWidth="2.5"
                style={{ transition: "r 0.2s", cursor: "pointer" }}
                onMouseEnter={() => setHovered({ index: i, ...d, x: cx, y: cy })}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}
        {data.map((d, i) => (
          <text key={i} x={xScale(i)} y={H - PAD.b + 24} textAnchor="middle" fontSize="0.8rem" fontWeight="600" fill="#64748b">{d.month}</text>
        ))}

        {/* Tooltip */}
        {hovered && (
          <g transform={`translate(${hovered.x}, ${hovered.y - 12})`}>
            <rect x="-20" y="-30" width="40" height="24" rx="6" fill="#1e293b" />
            <path d="M-6 -6 L0 0 L6 -6" fill="#1e293b" />
            <text textAnchor="middle" y="-14" fontSize="1rem" fontWeight="700" fill="white">
              {hovered.value}
            </text>
          </g>
        )}

        <g transform={`translate(${W / 2 - 32}, ${H - 6})`}>
          <circle cx="5" cy="0" r="5" fill="white" stroke="#1e40af" strokeWidth="2.5" />
          <text x="16" y="5" fontSize="0.8rem" fontWeight="600" fill="#64748b">Repairs</text>
        </g>
      </svg>
    </div>
  );
}

// ─── PIE CHART with sidebar legend ────────────────────────────────────────────
function PieChart({ data }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20, fontSize: 32, fontWeight: 800 }}>0</p>;
  const R = 80, CX = 100, CY = 100;
  const toRad = (deg) => (deg * Math.PI) / 180;
  
  const arc = (startDeg, endDeg, isHovered) => {
    const rIn = isHovered ? R + 5 : R;
    const x1 = CX + rIn * Math.cos(toRad(startDeg));
    const y1 = CY + rIn * Math.sin(toRad(startDeg));
    const x2 = CX + rIn * Math.cos(toRad(endDeg));
    const y2 = CY + rIn * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${CX} ${CY} L ${x1} ${y1} A ${rIn} ${rIn} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  const slices = data.reduce((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].endAngle : -90;
    const sweep = (d.pct / 100) * 360;
    return [...acc, { ...d, startAngle: prev, endAngle: prev + sweep }];
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center", width: "100%" }}>
      {/* Pie - Enlarged to 380px for ultimate visibility as requested */}
      <svg viewBox="0 0 200 200" style={{ width: 380, height: 380, flexShrink: 0, overflow: "visible" }}>
        {slices.map((s, i) => {
          const isHovered = hovered?.index === i;
          return (
            <path
              key={i} d={arc(s.startAngle, s.endAngle, isHovered)}
              fill={s.color} stroke="white" strokeWidth="2"
              style={{ transition: "all 0.3s ease", cursor: "pointer", opacity: hovered && !isHovered ? 0.6 : 1 }}
              onMouseEnter={() => setHovered({ index: i, ...s })}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Simple center tooltip for Pie */}
        {hovered && (
          <g transform={`translate(${CX}, ${CY})`}>
            {/* Soft shadow effect circle */}
            <circle r="40" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
            <circle r="38" fill="white" stroke={hovered.color} strokeWidth="2" />
            <text textAnchor="middle" y="-5" fontSize="1rem" fontWeight="700" fill="#1e293b">{hovered.label}</text>
            <text textAnchor="middle" y="18" fontSize="1.1rem" fontWeight="800" fill={hovered.color}>{hovered.pct}%</text>
          </g>
        )}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", opacity: hovered && hovered.index !== i ? 0.5 : 1, transition: "opacity 0.2s" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0, marginRight: 10 }} />
            <span style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600, width: 100, flexShrink: 0 }}>{s.label}</span>
            <span style={{ fontSize: "1rem", color: s.color, fontWeight: 800, width: 50, textAlign: "right" }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SVG BAR CHART ───────────────────────────────────────────────────────────
// Props: data = [{ label: string, value: number }]
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return <p style={{ color: "#94a3b8", textAlign: "center", padding: 20, fontSize: 32, fontWeight: 800 }}>0</p>;

  const W = 660, H = 200;
  const PAD = { t: 25, r: 20, b: 40, l: 44 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  // Interval of 5 as requested
  const step = 5;
  const yMax = Math.ceil(maxVal / step) * step;
  const yTicks = [];
  for (let t = 0; t <= yMax; t += step) yTicks.push(t);

  const barW = (plotW / data.length) * 0.55;
  const gap = plotW / data.length;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Y ticks (Grid Lines) */}
        {yTicks.map((t) => {
          const y = PAD.t + plotH - (t / yMax) * plotH;
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="0.8rem" fontWeight="600" fill="#94a3b8">{t}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const bH = (d.value / yMax) * plotH;
          const x = PAD.l + i * gap + (gap - barW) / 2;
          const y = PAD.t + plotH - bH;
          const isHovered = hovered?.index === i;
          
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={bH} rx="6"
                fill={isHovered ? "#059669" : "#10b981"}
                style={{ transition: "fill 0.2s", cursor: "pointer" }}
                onMouseEnter={() => setHovered({ index: i, ...d, x: x + barW/2, y: y })}
                onMouseLeave={() => setHovered(null)}
              />
              <text x={x + barW / 2} y={H - PAD.b + 22} textAnchor="middle" fontSize="0.8rem" fontWeight="600" fill="#64748b">{d.label}</text>
            </g>
          );
        })}

        {/* Tooltip Overlay */}
        {hovered && (
          <g transform={`translate(${hovered.x}, ${hovered.y - 10})`}>
            {/* Shadow/Backdrop */}
            <rect x="-24" y="-30" width="48" height="24" rx="6" fill="#1e293b" />
            <path d="M-6 -6 L0 0 L6 -6" fill="#1e293b" />
            <text textAnchor="middle" y="-14" fontSize="12" fontWeight="700" fill="white">
              {hovered.value}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const tabs = [
  {
    id: "products",
    label: "Danh sách Sản phẩm",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
      </svg>
    ),
  },
  {
    id: "repair-history",
    label: "Lịch sử Sửa chữa",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    id: "user-management",
    label: "Quản lý Người dùng",
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
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [metrics, setMetrics] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [productsRes, warrantiesRes, repairsRes] = await Promise.all([
          productService.getAllProducts(),
          warrantyService.getAllWarranties(),
          repairService.getAllRepairs()
        ]);

        const products = productsRes.data || [];
        const warranties = warrantiesRes.data || [];
        const repairs = repairsRes.data || [];

        const activeWarranties = warranties.filter(w => w.status === true).length;
        const completedRepairs = repairs.filter(r => r.status === "completed" || r.status === "done").length;

        // 1. Logic for LineChart (Dynamic Last 6 Months)
        const monthNames = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];
        const today = new Date();
        const last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          last6Months.push({
            month: monthNames[d.getMonth()],
            year: d.getFullYear(),
            monthIdx: d.getMonth(),
            value: 0
          });
        }

        repairs.forEach(r => {
          const rDate = new Date(r.repairDate || r.createdAt);
          const rMonth = rDate.getMonth();
          const rYear = rDate.getFullYear();
          
          const match = last6Months.find(m => m.monthIdx === rMonth && m.year === rYear);
          if (match) match.value++;
        });

        setLineData(last6Months.map(m => ({ month: m.month, value: m.value })));

        // 2. Logic for PieChart (Product Categories by Brand - Top 5 + Other)
        const brandsCount = products.reduce((acc, p) => {
          acc[p.brand] = (acc[p.brand] || 0) + 1;
          return acc;
        }, {});
        
        // Sort brands by count descending
        const sortedBrands = Object.entries(brandsCount)
          .sort((a, b) => b[1] - a[1]);
        
        const top5 = sortedBrands.slice(0, 5);
        const others = sortedBrands.slice(5);
        const othersCount = others.reduce((sum, item) => sum + item[1], 0);

        const totalProds = products.length || 1;
        const COLORS = ["#1e3a8a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#64748b"]; // Added grey for Other
        
        const newPieData = top5.map(([brand, count], idx) => ({
          label: brand,
          pct: Math.round((count / totalProds) * 100),
          color: COLORS[idx]
        }));

        if (othersCount > 0) {
          newPieData.push({
            label: "Khác",
            pct: Math.round((othersCount / totalProds) * 100),
            color: COLORS[5]
          });
        }
        setPieData(newPieData);

        // 3. Logic for BarChart (Intelligent Repair Categorization)
        // 3. Logic for BarChart (Intelligent Repair Categorization)
        const CATEGORIES = {
          "Màn hình": ["màn hình", "kính", "cảm ứng", "screen", "display"],
          "Pin/Nguồn": ["pin", "nguồn", "sạc", "battery", "power"],
          "Phần cứng": ["main", "board", "chip", "ram", "ssd", "ổ cứng", "loa", "mic"],
          "Phần mềm": ["phần mềm", "ios", "windows", "cài lại", "software", "unlock"]
        };

        const repairTypeCounts = repairs.reduce((acc, r) => {
          const content = (r.repairContent || "").toLowerCase();
          let matched = false;
          for (const [cat, keywords] of Object.entries(CATEGORIES)) {
            if (keywords.some(kw => content.includes(kw))) {
              acc[cat] = (acc[cat] || 0) + 1;
              matched = true;
              break;
            }
          }
          if (!matched) acc["Khác"] = (acc["Khác"] || 0) + 1;
          return acc;
        }, {});

        const newBarData = Object.entries(repairTypeCounts).map(([cat, count]) => ({
          label: cat,
          value: count
        }));
        setBarData(newBarData);

        const warrantyRate = products.length > 0 
          ? Math.round((activeWarranties / products.length) * 100) 
          : 0;
        
        const repairRate = repairs.length > 0 
          ? Math.round((completedRepairs / repairs.length) * 100) 
          : 0;

        setMetrics([
          {
            label: "Tổng Sản Phẩm",
            value: products.length,
            trend: "+0%",
            up: true,
            icon: <Package size={20} color="#2563eb" />,
            bgColor: "#eff6ff",
          },
          {
            label: "Bảo Hành Hiệu Lực",
            value: activeWarranties,
            trend: "Thời gian thực",
            up: true,
            icon: <ShieldCheck size={20} color="#059669" />,
            bgColor: "#ecfdf5",
          },
          {
            label: "Tổng Lượt Sửa Chữa",
            value: repairs.length,
            trend: "Tất cả",
            up: true,
            icon: <Wrench size={20} color="#4f46e5" />,
            bgColor: "#eef2ff",
          },
          {
            label: "Sửa Chữa Hoàn Tất",
            value: completedRepairs,
            trend: "Đã xong",
            up: true,
            icon: <CheckCircle size={20} color="#0d9488" />,
            bgColor: "#f0fdfa",
          },
        ]);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const card = {
    background: "white",
    borderRadius: "1rem",
    padding: "2rem",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
  };

  return (
    <div className="admin-page-wrapper">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        {metrics.map((m, i) => (
          <div 
            key={i} 
            style={{
              background: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-0.25rem)";
              e.currentTarget.style.boxShadow = "0 12px 20px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.04)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ 
                width: "3rem", 
                height: "3rem", 
                borderRadius: "0.75rem", 
                background: m.bgColor,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                {m.icon}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 1.125rem",
                borderRadius: "999px",
                fontSize: "0.875rem",
                fontWeight: 800,
                background: m.up ? "#ecfdf5" : "#fff7ed",
                color: m.up ? "#059669" : "#ea580c",
                border: `1px solid ${m.up ? "#d1fae5" : "#ffedd5"}`
              }}>
                {m.up ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {m.trend}
              </div>
            </div>

            <div>
              <p style={{ 
                color: "#1e293b", 
                fontSize: "1.5rem", 
                fontWeight: 800, 
                margin: "0 0 0.5rem 0",
                letterSpacing: "-0.01em",
                lineHeight: 1.2
              }}>
                {m.label}
              </p>
              <h3 style={{ 
                fontSize: "3rem", 
                fontWeight: 900, 
                color: "#0f172a", 
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1
              }}>
                {m.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 (2 Columns) ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))", gap: 16, marginBottom: 24, maxWidth: "100%" }}>
        {/* Line Chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: 0, paddingLeft: "0.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", letterSpacing: "-0.01em" }}>Xu Hướng Sửa Chữa Hàng Tháng</span>
          </div>
          <LineChart data={lineData} />
        </div>

        {/* Pie Chart */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: 0, paddingLeft: "0.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", letterSpacing: "-0.01em" }}>Phân Bố Danh Mục Sản Phẩm</span>
          </div>
          <PieChart data={pieData} />
        </div>
      </div>

      {/* ── Charts Row 2 (Full Width) ────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: 0, paddingLeft: "0.5rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: "1.5rem", color: "#0f172a", letterSpacing: "-0.01em" }}>Phân Bố Loại Hình Sửa Chữa</span>
        </div>
        <BarChart data={barData} />
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="admin-tabs-container">
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        {activeTab === "products" && <ProductList />}
        {activeTab === "repair-history" && <RepairHistory />}
        {activeTab === "user-management" && <UserManagement />}
      </div>
    </div>
  );
}

export default AdminDashboard;

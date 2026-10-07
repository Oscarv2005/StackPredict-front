import { useState, useEffect, useRef } from "react";
import "./index.css";

// Real monthly data from online_shoppers_intention.csv
const monthlyData = [
  { month: "Feb", cr: 1.6, pv: 0.89, sessions: 184 },
  { month: "Mar", cr: 10.1, pv: 3.96, sessions: 1907 },
  { month: "May", cr: 10.9, pv: 5.43, sessions: 3364 },
  { month: "Jun", cr: 10.1, pv: 3.39, sessions: 288 },
  { month: "Jul", cr: 15.3, pv: 4.1, sessions: 432 },
  { month: "Aug", cr: 17.6, pv: 5.94, sessions: 433 },
  { month: "Sep", cr: 19.2, pv: 7.56, sessions: 448 },
  { month: "Oct", cr: 20.9, pv: 8.65, sessions: 549 },
  { month: "Nov", cr: 25.4, pv: 7.13, sessions: 2998 },
  { month: "Dec", cr: 12.5, pv: 6.83, sessions: 1727 },
];

function LineChart({ metric, theme }) {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const isCR = metric === "cr";
  const color = isCR ? "#0f9d74" : "#3a4bff";
  const values = monthlyData.map((d) => d[metric]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink-rgb").trim() || "20,27,52";
    const surface = css.getPropertyValue("--surface").trim() || "#ffffff";
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 20, bottom: 32, left: 36 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const range = max - min || 1;

    const pts = values.map((v, i) => ({
      x: pad.left + (i / (values.length - 1)) * chartW,
      y: pad.top + (1 - (v - min) / range) * chartH,
    }));

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = `rgba(${ink},0.08)`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    // Y labels
    ctx.fillStyle = `rgba(${ink},0.55)`;
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const v = min + (range * (4 - i)) / 4;
      const y = pad.top + (i / 4) * chartH;
      ctx.fillText(
        isCR ? v.toFixed(0) + "%" : v.toFixed(1),
        pad.left - 6,
        y + 4,
      );
    }

    // X labels
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(${ink},0.6)`;
    monthlyData.forEach((d, i) => {
      ctx.fillText(d.month, pts[i].x, H - 6);
    });

    // Fill area under curve
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(
      0,
      isCR ? "rgba(15,157,116,0.22)" : "rgba(58,75,255,0.18)",
    );
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + chartH);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    pts.forEach((p, i) =>
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
    );
    ctx.stroke();

    // Dots
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = surface;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Store pts for hover
    canvas._pts = pts;
  }, [metric, theme]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._pts) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    let closest = null;
    let minDist = Infinity;
    canvas._pts.forEach((p, i) => {
      const d = Math.abs(mx - p.x);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });
    if (closest !== null && minDist < 40) {
      const d = monthlyData[closest];
      setTooltip({
        i: closest,
        label: d.month,
        val: isCR ? d.cr + "%" : d.pv.toFixed(2),
        sessions: d.sessions.toLocaleString(),
      });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "crosshair",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "8px 14px",
            pointerEvents: "none",
            fontSize: 12,
            color: "#fff",
            whiteSpace: "nowrap",
            backdropFilter: "blur(6px)",
          }}
        >
          <span
            style={{ color: isCR ? "#0f9d74" : "#3a4bff", fontWeight: 600 }}
          >
            {tooltip.label}
          </span>
          {" · "}
          <span style={{ fontWeight: 600 }}>{tooltip.val}</span>
          {" · "}
          <span style={{ color: "rgba(255,255,255,0.5)" }}>
            {tooltip.sessions} sessions
          </span>
        </div>
      )}
    </div>
  );
}

function Hero({ setPage, theme }) {
  const [metric, setMetric] = useState("cr");
  const best = monthlyData.reduce((a, b) => (b[metric] > a[metric] ? b : a));
  const busiest = monthlyData.reduce((a, b) =>
    b.sessions > a.sessions ? b : a,
  );
  const total = monthlyData.reduce((s, d) => s + d.sessions, 0);
  const fmt = (d) => (metric === "cr" ? d.cr + "%" : d.pv.toFixed(2));
  const insight =
    metric === "cr"
      ? "Conversion climbs through autumn and peaks in Nov. Traffic is highest in May, but those visitors convert less."
      : "Page value rises steadily from Feb to Oct. Higher-value pages are the strongest buying signal.";

  return (
    <section className="hero">
      <div className="hero-container">
        {/* Left: copy */}
        <div className="hero-left">
          <div className="hero-eyebrow">ML-Powered Predictions</div>
          <h1 className="hero-title">
            Know which visitors
            <br />
            will become <em>buyers</em>
          </h1>
          <p className="hero-desc">
            StackPredict analyses browsing patterns — pages visited, time spent,
            bounce and exit signals — to predict page value before your visitor
            checks out.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setPage("form")}>
              Run a prediction →
            </button>
          </div>
        </div>

        {/* Right: line chart */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <span className="chart-panel-title">
              Shoppers dataset · 2023–24
            </span>
            <div className="chart-toggles">
              <span
                className={`chart-toggle ${metric === "cr" ? "active-cr" : "inactive"}`}
                onClick={() => setMetric("cr")}
              >
                Conversion rate
              </span>
              <span
                className={`chart-toggle ${metric === "pv" ? "active-pv" : "inactive"}`}
                onClick={() => setMetric("pv")}
              >
                Avg page value
              </span>
            </div>
          </div>
          <div className="chart-wrap">
            <LineChart metric={metric} theme={theme} />
          </div>
          <div className="kpis">
            <div className="kpi">
              <span>Best month</span>
              <b>{best.month}</b>
              <small>{fmt(best)}</small>
            </div>
            <div className="kpi">
              <span>Busiest month</span>
              <b>{busiest.month}</b>
              <small>{busiest.sessions.toLocaleString()} sessions</small>
            </div>
            <div className="kpi">
              <span>Total sessions</span>
              <b>{total.toLocaleString()}</b>
              <small>Feb to Dec</small>
            </div>
          </div>
          <p className="insight">{insight}</p>
        </div>
      </div>
    </section>
  );
}

export default Hero;

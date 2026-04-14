import { useEffect, useRef, useState } from "react";

export default function Chart({ data }) {
  const W=360, H=130, PL=4, PR=4, PT=12, PB=20;
  const [progress, setProgress] = useState(0);
  const [tooltip, setTooltip] = useState(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setProgress(0);
    startRef.current = null;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / 1200, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [data]);

  const n = data.length;
  const vals = data.flatMap(d => [d.a ?? 0, d.p]);
  const max = Math.max(...vals) * 1.12;
  const x = i => PL + (i / (n - 1)) * (W - PL - PR);
  const y = v => PT + (1 - v / max) * (H - PT - PB);

  const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const ep = ease(progress);

  const mkPathSegment = (k) => {
    const pts = data.map((d, i) => d[k] != null ? [x(i), y(d[k])] : null).filter(Boolean);
    if (!pts.length) return "";
    // Clip by progress
    const totalLen = pts.length - 1;
    const visible = Math.floor(ep * totalLen * 100) / 100;
    const full = Math.floor(visible);
    const frac = visible - full;

    let path = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i <= Math.min(full, pts.length - 1); i++) {
      path += ` L ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`;
    }
    if (frac > 0 && full < pts.length - 1) {
      const interpX = pts[full][0] + (pts[full + 1][0] - pts[full][0]) * frac;
      const interpY = pts[full][1] + (pts[full + 1][1] - pts[full][1]) * frac;
      path += ` L ${interpX.toFixed(1)} ${interpY.toFixed(1)}`;
    }
    return path;
  };

  const mkArea = (k, pathStr) => {
    const pts = data.map((d, i) => d[k] != null ? [x(i), y(d[k])] : null).filter(Boolean);
    if (!pts.length || !pathStr) return "";
    const fi = data.findIndex(d => d[k] != null);
    return pathStr + ` L ${pathStr.split(" ").slice(-2).join(" ")} L ${pathStr.split(" ").slice(-2)[0]} ${y(0).toFixed(1)} L ${x(fi).toFixed(1)} ${y(0).toFixed(1)} Z`;
  };

  const pathA = mkPathSegment("a");
  const pathP = mkPathSegment("p");

  const svgRef = useRef(null);
  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width * W;
    let nearest = null, nearestDist = 999;
    data.forEach((d, i) => {
      const xi = x(i);
      const dist = Math.abs(mx - xi);
      if (dist < nearestDist && (d.a != null || d.p != null)) {
        nearestDist = dist;
        nearest = { ...d, xi, ya: d.a != null ? y(d.a) : null, yp: y(d.p), i };
      }
    });
    if (nearest && nearestDist < 20) setTooltip(nearest);
    else setTooltip(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 130, overflow: "visible", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8ff57" stopOpacity=".2"/><stop offset="100%" stopColor="#b8ff57" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".16"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {[.25,.5,.75].map(v => (
          <line key={v} x1={PL} y1={y(max*v)} x2={W-PR} y2={y(max*v)} stroke="rgba(255,255,255,.05)" strokeWidth="1"/>
        ))}
        {[.25,.5,.75].map(v => (
          <text key={v} x={PL} y={y(max*v)-3} fontSize="7" fill="rgba(255,255,255,.2)" fontFamily="JetBrains Mono,monospace">
            {Math.round(max*v)}
          </text>
        ))}

        {/* Area fills */}
        <path d={mkArea("a", pathA)} fill="url(#ga)" opacity={ep}/>
        <path d={mkArea("p", pathP)} fill="url(#gp)" opacity={ep}/>

        {/* Lines */}
        <path d={pathA} fill="none" stroke="#b8ff57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
        <path d={pathP} fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Dots */}
        {data.map((d, i) => d.a != null && (
          <circle key={i} cx={x(i)} cy={y(d.a)} r={tooltip?.i === i ? "5" : "3"}
            fill="#080810" stroke="#b8ff57" strokeWidth="1.5"
            style={{ transition: "r .15s" }}
            opacity={ep >= i / (n - 1) ? 1 : 0}
          />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H-3} textAnchor="middle" fontSize="8" fill={tooltip?.i === i ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)"} fontFamily="JetBrains Mono,monospace">{d.m}</text>
        ))}

        {/* Tooltip crosshair */}
        {tooltip && (
          <line x1={x(tooltip.i)} y1={PT} x2={x(tooltip.i)} y2={H-PB} stroke="rgba(255,255,255,.12)" strokeWidth="1" strokeDasharray="3 2"/>
        )}

        {/* Legend */}
        <line x1={W-100} y1="8" x2={W-88} y2="8" stroke="#b8ff57" strokeWidth="2"/>
        <text x={W-84} y="12" fontSize="8" fill="rgba(255,255,255,.45)" fontFamily="JetBrains Mono,monospace">Actual</text>
        <line x1={W-50} y1="8" x2={W-38} y2="8" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2"/>
        <text x={W-34} y="12" fontSize="8" fill="rgba(255,255,255,.45)" fontFamily="JetBrains Mono,monospace">Pred</text>
      </svg>

      {tooltip && (
        <div style={{
          position: "absolute",
          left: `calc(${(x(tooltip.i) / W) * 100}% + 8px)`,
          top: tooltip.ya ? `${(tooltip.ya / H) * 100}%` : "20%",
          background: "rgba(16,16,28,.95)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 8,
          padding: ".5rem .75rem",
          fontSize: ".72rem",
          fontFamily: "'JetBrains Mono', monospace",
          pointerEvents: "none",
          zIndex: 10,
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
          boxShadow: "0 8px 24px rgba(0,0,0,.4)"
        }}>
          <div style={{ color: "#f0f2ff", fontWeight: 700, marginBottom: ".2rem" }}>{tooltip.m}</div>
          {tooltip.a != null && <div style={{ color: "#b8ff57" }}>Actual: {tooltip.a}</div>}
          <div style={{ color: "#8b5cf6" }}>Predicted: {tooltip.p}</div>
        </div>
      )}
    </div>
  );
}

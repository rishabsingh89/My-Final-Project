import { useState, useEffect, useRef } from "react";
import { useToast } from "./Toast.jsx";
import s from "./Simulator.module.css";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const diff = end - start;
    if (diff === 0) return;
    const duration = 400;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const cur = Math.round(start + diff * ease);
      setDisplay(cur);
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export default function Simulator() {
  const [avg, setAvg] = useState(250);
  const [gr, setGr] = useState(15);
  const [sea, setSea] = useState(12);
  const toast = useToast();

  const pred = Math.round(avg * (1 + gr / 100) * (sea / 10));
  const safe = Math.round(pred * .25);
  const reo  = Math.round(pred * .35);

  const handleReorder = () => {
    toast(`Auto-reorder triggered for ${pred.toLocaleString()} units`, "ok");
  };

  const handleRisk = () => {
    if (gr < 0) toast("Warning: negative growth — overstocking risk detected", "warn");
    else if (pred > 3000) toast("High demand forecast — consider bulk pricing", "info");
    else toast("Stock levels look healthy for current forecast", "ok");
  };

  return (
    <div>
      <span className="stag">// Live Demo</span>
      <h2 className="sh">Demand Prediction <span style={{ color: "var(--lime)" }}>Simulator</span></h2>
      <p className="sp">Drag the sliders — our forecasting engine calculates optimal stock levels in real time.</p>
      <div className={s.wrap}>
        <div className={s.sliders}>
          {[
            { label: "Avg Monthly Sales", min: 50, max: 1000, step: 1, value: avg, set: setAvg, fmt: v => `${v} units / mo` },
            { label: "Growth Rate",       min: -20, max: 60, step: 1, value: gr,  set: setGr,  fmt: v => `${v > 0 ? "+" : ""}${v}%` },
            { label: "Seasonal Factor",   min: 5,  max: 25,  step: 1, value: sea, set: setSea, fmt: v => `${(v / 10).toFixed(1)}×` },
          ].map(({ label, min, max, step, value, set, fmt }) => (
            <div className={s.sl} key={label}>
              <label>{label}</label>
              <div className={s.sliderRow}>
                <input
                  type="range" min={min} max={max} step={step} value={value}
                  onChange={e => set(+e.target.value)}
                  style={{ "--pct": `${((value - min) / (max - min)) * 100}%` }}
                />
                <span className={s.val}>{fmt(value)}</span>
              </div>
            </div>
          ))}
          <div className={s.simBtns}>
            <button className={s.simBtn} onClick={handleReorder}>⟳ Trigger Reorder</button>
            <button className={s.simBtnGhost} onClick={handleRisk}>⚑ Analyze Risk</button>
          </div>
        </div>
        <div className={s.out}>
          {[[pred, "Predicted Demand", "var(--lime)"], [safe, "Safety Stock", "var(--amber)"], [reo, "Reorder Point", "var(--violet)"]].map(([n, l, c]) => (
            <div className={s.oc} key={l}>
              <span className={s.on} style={{ color: c }}>
                <AnimatedNumber value={n} />
              </span>
              <span className={s.ol}>{l}</span>
              <div className={s.miniBar} style={{ "--fill": `${Math.min((n / (pred * 1.2)) * 100, 100)}%`, "--c": c }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

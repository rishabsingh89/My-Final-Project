import { useState, useEffect } from "react";
import Chart from "../components/Chart.jsx";
import { useToast } from "../components/Toast.jsx";
import { PRODUCTS, CHART_DATA, ALERTS } from "../data.js";
import s from "./Dashboard.module.css";
import ParticleBg from "../components/ParticleBg.jsx";

const DOT = { ok:"var(--lime)", wn:"var(--amber)", cr:"var(--rose)", info:"var(--cyan)" };

export default function Dashboard() {
  const [live,  setLive]  = useState(false);
  const [prods, setProds] = useState(PRODUCTS);
  const [tick,  setTick]  = useState(0);
  const [alerts, setAlerts] = useState(ALERTS);
  const toast = useToast();

  const toggleLive = () => {
    const next = !live;
    setLive(next);
    if (next) toast("Live simulation started — stock updating every 1.4s", "info");
    else toast("Simulation paused", "warn");
  };

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setProds(p => {
        const updated = p.map(x => ({
          ...x,
          stock: Math.max(0, x.stock + Math.round((Math.random() - 0.55) * 18)),
        }));
        // Alert if a product goes critical
        updated.forEach((u, i) => {
          const prev = p[i];
          const nowCrit = u.stock < 20 && u.stock !== 0;
          const wasCrit = prev.stock < 20;
          if (nowCrit && !wasCrit) {
            toast(`⚠ ${u.name} — critically low: ${u.stock} units`, "err");
            setAlerts(a => [{
              id: Date.now(),
              t: "cr",
              msg: `${u.name} fell critical (${u.stock} units)`,
              time: "just now"
            }, ...a.slice(0, 6)]);
          }
        });
        return updated;
      });
      setTick(t => t + 1);
    }, 1400);
    return () => clearInterval(id);
  }, [live, toast]);

  const kpis = [
    { v: "1,247",                                  l: "Total SKUs",    d: "+12 this week",       c: "var(--lime)"  },
    { v: "98.2%",                                  l: "Accuracy",      d: "+0.3% vs last month", c: "var(--green)" },
    { v: prods.filter(p => p.st === "cr").length,  l: "Critical Items",d: "Needs attention",     c: "var(--rose)"  },
    { v: "8",                                      l: "Auto Reorders", d: "Triggered today",     c: "var(--amber)" },
  ];

  return (
    <div className={s.pg}>
      <ParticleBg count={20} color="139,92,246" />

      {/* Header */}
      <div className={s.head}>
        <div className={s.headIn}>
          <div className={s.headTop}>
            <div>
              <div className={s.hl}>Analytics Dashboard</div>
              <div className={s.sub}>Real-time inventory intelligence · PredictiveSys v2.4</div>
            </div>
            <button className={`${s.liveBtn} ${live ? s.on : ""}`} onClick={toggleLive}>
              <span className={s.ldot} />
              {live ? `LIVE · tick ${tick}` : "Start Live Simulation"}
            </button>
          </div>
          <div className={s.kpis}>
            {kpis.map((k, i) => (
              <div className={s.kc} key={i} style={{ "--accent": k.c }}>
                <span className={s.kv} style={{ color: k.c }}>{k.v}</span>
                <span className={s.kl}>{k.l}</span>
                <span className={s.kd} style={{ color: k.c, opacity: 0.7 }}>{k.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={s.body}>
        <div className={s.grid}>
          <div className={s.panel}>
            <div className={s.ptitle}>
              <span>Demand Forecast — 10 Month View</span>
              <span className={s.legend}>
                <span style={{ color: "var(--lime)" }}>— Actual</span>
                <span style={{ color: "var(--violet)" }}>- - Predicted</span>
              </span>
            </div>
            <Chart data={CHART_DATA} />
          </div>

          <div className={s.panel}>
            <div className={s.ptitle}>
              <span>Live Alerts</span>
              <span style={{ fontSize: ".64rem", color: "var(--fog)" }}>{alerts.length} events</span>
            </div>
            <div className={s.feed}>
              {alerts.map((a, i) => (
                <div className={s.aitem} key={a.id} style={{ animationDelay: `${i * .04}s` }}>
                  <div className={s.adot} style={{ background: DOT[a.t] || DOT.info }} />
                  <span className={s.amsg}>{a.msg}</span>
                  <span className={s.atime}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory table */}
        <div className={`${s.panel} ${s.mt}`}>
          <div className={s.ptitle}>
            <span>Inventory Overview</span>
            <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
              {live && <span className={s.livePill}><span className={s.ldot2}/>LIVE</span>}
              <span style={{ fontSize: ".68rem", color: "var(--fog)" }}>{prods.length} products</span>
            </div>
          </div>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th>
                <th>Stock</th><th>Predicted</th><th>Level</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prods.map(p => {
                const pct = Math.min((p.stock / p.pred) * 100, 100);
                const bc  = p.st === "ok" ? "var(--lime)" : p.st === "wn" ? "var(--amber)" : "var(--rose)";
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className={s.mono} style={{ color: "var(--fog)" }}>{p.sku}</td>
                    <td style={{ fontSize: ".72rem", color: "var(--fog)" }}>{p.cat}</td>
                    <td className={s.mono} style={{ transition: "color .4s", color: p.stock < 20 ? "var(--rose)" : "inherit" }}>
                      {p.stock.toLocaleString()}
                    </td>
                    <td className={s.mono} style={{ color: "var(--fog)" }}>{p.pred}</td>
                    <td>
                      <div className={s.bar}>
                        <div className={s.barFill} style={{ width: `${pct.toFixed(0)}%`, background: bc }} />
                      </div>
                    </td>
                    <td>
                      <span className={`${s.badge} ${s["b_" + p.st]}`}>
                        {p.st === "ok" ? "● Healthy" : p.st === "wn" ? "⚠ Reorder" : "✕ Critical"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

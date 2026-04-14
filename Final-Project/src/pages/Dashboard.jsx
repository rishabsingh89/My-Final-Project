import { useState, useEffect, useCallback } from "react";
import Chart from "../components/Chart.jsx";
import { useToast } from "../components/Toast.jsx";
import { CHART_DATA, ALERTS } from "../data.js";
import s from "./Dashboard.module.css";
import ParticleBg from "../components/ParticleBg.jsx";
import api from "../api.js";
import ProductModal from "../components/ProductModal.jsx";
import StockModal from "../components/StockModal.jsx";

const DOT = { ok:"var(--lime)", wn:"var(--amber)", cr:"var(--rose)", info:"var(--cyan)" };

export default function Dashboard() {
  const [live,  setLive]  = useState(false);
  const [prods, setProds] = useState([]);
  const [tick,  setTick]  = useState(0);
  const [alerts, setAlerts] = useState(ALERTS);
  const [chartData, setChartData] = useState(CHART_DATA);
  const [showProd, setShowProd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showStock, setShowStock] = useState(false);
  const [stockId, setStockId] = useState(null);
  const toast = useToast();

  const openProd = (p=null) => {
    setEditId(p);
    setShowProd(true);
  };

  const openStock = (p) => {
    setStockId(p);
    setShowStock(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      toast("Product deleted", "ok");
      fetchInventory();
    } catch (err) {
      toast(err.response?.data?.message || err.message, "err");
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const [invRes, statsRes, predRes] = await Promise.all([
        api.get("/inventory?limit=50").catch(() => null),
        api.get("/inventory/dashboard/stats").catch(() => null),
        api.get("/inventory/predictions/all").catch(() => null)
      ]);

      if (invRes?.data?.success) setProds(invRes.data.inventory);

      if (statsRes?.data?.success && predRes?.data?.success) {
        const trend = statsRes.data.monthlyTrend || [];
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        
        if (trend.length >= 2) { // Need at least a couple of data points
          const cData = trend.map(t => ({
            m: months[t._id.month - 1],
            a: t.totalConsumed,
            p: Math.floor(t.totalConsumed * 1.1)
          }));
          setChartData(cData);
        }

        const newAlerts = [];
        predRes.data.predictions.forEach((p, i) => {
           if (p.reorderUrgency === "critical") newAlerts.push({ id: `cr-${i}`, t: "cr", msg: `${p.productName} — critically low (${p.currentStock} units)`, time: "Now" });
           else if (p.reorderUrgency === "high") newAlerts.push({ id: `wn-${i}`, t: "wn", msg: `${p.productName} — needs reorder soon`, time: "Now" });
        });
        
        statsRes.data.recentActivity.slice(0, 5).forEach((act, i) => {
           const typeStr = act.type === "sale" ? "Sale recorded" : act.type === "restock" ? "Restock complete" : act.type;
           newAlerts.push({ id: `act-${i}`, t: act.type === "sale" ? "ok" : "info", msg: `${typeStr}: ${Math.abs(act.quantityChange)}x ${act.product?.name || 'Item'}`, time: new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        });
        
        setAlerts(newAlerts.length > 0 ? newAlerts : ALERTS);
      }
    } catch (err) {
      console.error(err);
      if(err.response?.status === 401) toast("Session expired. Please login again.", "err");
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleLive = () => {
    const next = !live;
    setLive(next);
    if (next) toast("Live sync started — fetching every 5s", "info");
    else toast("Live sync paused", "warn");
  };

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      fetchDashboardData();
      setTick(t => t + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [live, fetchDashboardData]);

  const kpis = [
    { v: prods.length.toString(),                                  l: "Total SKUs",    d: "Active items",       c: "var(--lime)"  },
    { v: "98.2%",                                  l: "Accuracy",      d: "+0.3% vs last month", c: "var(--green)" },
    { v: prods.filter(p => p.stockStatus === "out_of_stock" || p.quantity < p.reorderPoint).length,  l: "Critical Items",d: "Needs attention",     c: "var(--rose)"  },
    { v: "Backend",                                      l: "Data Sync", d: "Live DB connection",     c: "var(--amber)" },
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
            <Chart data={chartData} />
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
              <button 
                onClick={() => openProd()} 
                style={{ background: "var(--lime)", color: "var(--ink)", border: "none", padding: "0.25rem 0.8rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}
                onMouseOver={(e) => e.target.style.opacity = 0.8}
                onMouseOut={(e) => e.target.style.opacity = 1}
              >+ Add Product</button>
              {live && <span className={s.livePill}><span className={s.ldot2}/>LIVE</span>}
              <span style={{ fontSize: ".68rem", color: "var(--fog)" }}>{prods.length} products</span>
            </div>
          </div>
          <table className={s.tbl}>
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th>
                <th>Stock</th><th>Predicted</th><th>Level</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prods.map(p => {
                const pred = p.reorderQuantity || 50;
                const pct = Math.min((p.quantity / pred) * 100, 100);
                const isCrit = p.quantity < p.reorderPoint || p.stockStatus === "out_of_stock";
                const isWarn = p.stockStatus === "low_stock";
                const bc  = !isCrit && !isWarn ? "var(--lime)" : isWarn ? "var(--amber)" : "var(--rose)";
                const badgeClass = !isCrit && !isWarn ? s.b_ok : isWarn ? s.b_wn : s.b_cr;
                const badgeLabel = !isCrit && !isWarn ? "● Healthy" : isWarn ? "⚠ Reorder" : "✕ Critical";
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td className={s.mono} style={{ color: "var(--fog)" }}>{p.sku}</td>
                    <td style={{ fontSize: ".72rem", color: "var(--fog)" }}>{p.category}</td>
                    <td className={s.mono} style={{ transition: "color .4s", color: isCrit ? "var(--rose)" : "inherit" }}>
                      {p.quantity.toLocaleString()}
                    </td>
                    <td className={s.mono} style={{ color: "var(--fog)" }}>{pred.toLocaleString()}</td>
                    <td>
                      <div className={s.bar}>
                        <div className={s.barFill} style={{ width: `${pct.toFixed(0)}%`, background: bc }} />
                      </div>
                    </td>
                    <td>
                      <span className={`${s.badge} ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => openStock(p)} style={{ background: "transparent", border: "1px solid var(--rim)", color: "var(--lime)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem", transition: "background 0.2s" }} onMouseOver={e=>e.target.style.background="rgba(184,255,87,0.1)"} onMouseOut={e=>e.target.style.background="transparent"}>Stock</button>
                        <button onClick={() => openProd(p)} style={{ background: "transparent", border: "1px solid var(--rim)", color: "var(--cyan)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem", transition: "background 0.2s" }} onMouseOver={e=>e.target.style.background="rgba(34,211,238,0.1)"} onMouseOut={e=>e.target.style.background="transparent"}>Edit</button>
                        <button onClick={() => handleDelete(p._id)} style={{ background: "transparent", border: "1px solid var(--rim)", color: "var(--rose)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer", fontSize: "0.7rem", transition: "background 0.2s" }} onMouseOver={e=>e.target.style.background="rgba(244,63,94,0.1)"} onMouseOut={e=>e.target.style.background="transparent"}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showProd && <ProductModal p={editId} close={() => setShowProd(false)} refresh={fetchDashboardData} />}
      {showStock && <StockModal p={stockId} close={() => setShowStock(false)} refresh={fetchDashboardData} />}
    </div>
  );
}

import { useState } from "react";
import api from "../api.js";
import { useToast } from "./Toast.jsx";

export default function StockModal({ p, close, refresh }) {
  const [type, setType] = useState("sale");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!qty || Number(qty) <= 0) return toast("Quantity must be greater than 0", "err");
    setLoading(true);
    try {
      // quantityChange is negative if sale or damage
      const change = ['sale', 'damage', 'return'].includes(type) ? -Number(qty) : Number(qty);
      
      await api.patch(`/inventory/${p._id}/stock`, {
        type,
        quantityChange: change,
        note
      });
      
      toast(`Logged ${type} of ${qty} items`, "ok");
      refresh();
      close();
    } catch (err) {
      toast(err.response?.data?.message || err.message, "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)", padding: "20px" }}>
      <div style={{ 
        background: "var(--ink2)", 
        width: "100%", 
        maxWidth: "420px", 
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: "16px", 
        border: "1px solid var(--rim)", 
        padding: "2rem", 
        color: "var(--snow)", 
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)", 
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--cyan)" }}>Update Stock</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--fog)" }}>{p.name} (SKU: {p.sku})</span>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", color: "var(--fog)", cursor: "pointer", fontSize: "1.5rem" }}>&times;</button>
        </div>
        
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--ink3)", borderRadius: "8px", border: "1px solid var(--rim)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--fog)", fontSize: "0.9rem" }}>Current Stock:</span>
          <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: p.quantity < p.reorderPoint ? "var(--rose)" : "var(--lime)" }}>{p.quantity} {p.unit}</span>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Action Type</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: "0.75rem", background: "var(--ink)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "inherit" }}>
              <option value="sale">Record Sale (Stock Out)</option>
              <option value="restock">Receive Delivery (Stock In)</option>
              <option value="damage">Report Damage (Stock Out)</option>
              <option value="adjustment">Manual Adjustment (Stock In)</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Quantity</label>
            <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required placeholder="e.g. 5" style={{ width: "100%", padding: "0.75rem", background: "var(--ink)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Order #1042" style={{ width: "100%", padding: "0.75rem", background: "var(--ink)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "inherit" }} />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={close} style={{ padding: "0.7rem 1.5rem", background: "transparent", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "100px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "0.7rem 1.5rem", background: "var(--cyan)", border: "none", color: "var(--ink)", fontWeight: 600, borderRadius: "100px", cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Processing..." : "Confirm Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

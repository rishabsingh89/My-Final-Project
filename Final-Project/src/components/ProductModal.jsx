import { useState, useEffect } from "react";
import api from "../api.js";
import { useToast } from "./Toast.jsx";

export default function ProductModal({ p, close, refresh }) {
  const [form, setForm] = useState({
    name: "", sku: "", category: "Electronics", quantity: 0,
    costPrice: 0, sellingPrice: 0, reorderPoint: 10, reorderQuantity: 50,
    unit: "units", description: ""
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (p) setForm({ ...p });
  }, [p]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (p) {
        await api.put(`/inventory/${p._id}`, form);
        toast("Product updated successfully", "ok");
      } else {
        await api.post("/inventory", form);
        toast("Product added successfully", "ok");
      }
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
        maxWidth: "550px", 
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
          <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--lime)" }}>{p ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={close} style={{ background: "none", border: "none", color: "var(--fog)", cursor: "pointer", fontSize: "1.5rem" }}>&times;</button>
        </div>
        
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Product Name</label>
            <input type="text" value={form.name} onChange={set("name")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>SKU</label>
            <input type="text" value={form.sku} onChange={set("sku")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", textTransform: "uppercase", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Category</label>
            <input type="text" value={form.category} onChange={set("category")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Cost Price ($)</label>
            <input type="number" step="0.01" value={form.costPrice} onChange={set("costPrice")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Selling Price ($)</label>
            <input type="number" step="0.01" value={form.sellingPrice} onChange={set("sellingPrice")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Initial Quantity</label>
            <input type="number" value={form.quantity} onChange={set("quantity")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Unit</label>
            <select value={form.unit} onChange={set("unit")} style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "inherit" }}>
              {['units', 'kg', 'g', 'liters', 'ml', 'boxes', 'pieces', 'cartons'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Reorder Point (Low Alert)</label>
            <input type="number" value={form.reorderPoint} onChange={set("reorderPoint")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--fog)", marginBottom: "0.4rem" }}>Reorder Quantity (Target)</label>
            <input type="number" value={form.reorderQuantity} onChange={set("reorderQuantity")} required style={{ width: "100%", padding: "0.75rem", background: "var(--ink3)", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "6px", outline: "none", fontFamily: "'JetBrains Mono', monospace" }} />
          </div>
          
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button type="button" onClick={close} style={{ padding: "0.7rem 1.5rem", background: "transparent", border: "1px solid var(--rim)", color: "var(--snow)", borderRadius: "100px", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: "0.7rem 1.5rem", background: "var(--lime)", border: "none", color: "var(--ink)", fontWeight: 600, borderRadius: "100px", cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Saving..." : p ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

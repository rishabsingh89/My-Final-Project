import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

const ICONS = {
  ok:   { icon: "✓", color: "var(--lime)",   bg: "rgba(184,255,87,.1)",  border: "rgba(184,255,87,.25)" },
  warn: { icon: "⚠", color: "var(--amber)",  bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.25)" },
  err:  { icon: "✕", color: "var(--rose)",   bg: "rgba(244,63,94,.1)",   border: "rgba(244,63,94,.25)" },
  info: { icon: "◈", color: "var(--cyan)",   bg: "rgba(34,211,238,.1)",  border: "rgba(34,211,238,.25)" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type, removing: false }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, removing: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350);
    }, duration);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem",
        zIndex: 9000, display: "flex", flexDirection: "column", gap: ".5rem",
        pointerEvents: "none"
      }}>
        {toasts.map(t => {
          const st = ICONS[t.type] || ICONS.info;
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: ".75rem",
              background: st.bg,
              border: `1px solid ${st.border}`,
              borderRadius: 12,
              padding: ".75rem 1.1rem",
              backdropFilter: "blur(20px)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: ".84rem",
              color: "#f0f2ff",
              boxShadow: "0 8px 32px rgba(0,0,0,.4)",
              minWidth: 240, maxWidth: 320,
              animation: t.removing ? "toastOut .35s ease forwards" : "toastIn .35s ease",
              pointerEvents: "all"
            }}>
              <span style={{ color: st.color, fontWeight: 700, fontSize: "1rem" }}>{st.icon}</span>
              {t.msg}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn  { from { opacity:0; transform:translateX(60px) scale(.9) } to { opacity:1; transform:translateX(0) scale(1) } }
        @keyframes toastOut { from { opacity:1; transform:translateX(0) scale(1) }     to { opacity:0; transform:translateX(60px) scale(.9) } }
      `}</style>
    </ToastCtx.Provider>
  );
}

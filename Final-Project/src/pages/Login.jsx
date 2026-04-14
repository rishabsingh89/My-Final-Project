import { useState } from "react";
import { useToast } from "../components/Toast.jsx";
import ParticleBg from "../components/ParticleBg.jsx";
import api from "../api.js";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M12 4.69c1.64 0 3.1.56 4.26 1.67h.01l3.14-3.14h0C17.48 1.34 14.93.02 12 .02A11.967 11.967 0 001.32 7.02l3.66 2.84C5.9 5.86 8.71 4.69 12 4.69z"/>
    <path fill="#34A853" d="M23.63 12.22c0-.85-.08-1.66-.22-2.45h-11.4v4.63h6.5c-.28 1.5-.113 2.76-2.02 4.02l3.22 2.5h0c1.88-1.74 2.92-4.32 2.92-8.7z"/>
    <path fill="#4A90E2" d="M5.27 14.15c-.22-.64-.34-1.32-.34-2.03 0-.7.12-1.38.34-2.03l-3.66-2.84A11.96 11.96 0 00.3 12.12c0 1.95.46 3.79 1.3 5.37l3.67-3.34z"/>
    <path fill="#FBBC05" d="M12 23.98c3.15 0 5.79-1.04 7.72-2.82l-3.23-2.5c-1.05.7-2.39 1.12-4.49 1.12-3.35 0-6.19-2.26-7.2-5.3H1.14v2.9c2.53 5.03 7.8 8.6 13.86 8.6z"/>
  </svg>
);


const EyeClosed = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
);

const EyeOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

export default function Login({ setAuth, nav }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const toast = useToast();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      return toast("Please fill in all required fields", "err");
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      
      const { data } = await api.post(endpoint, payload);
      
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast(`Welcome, ${data.user.name}!`, "ok");
        setAuth(true);
        nav("dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "An error occurred";
      toast(msg, "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      
      <div style={{
        position: "relative",
        background: "#ffffff",
        width: "90%", maxWidth: "400px",
        borderRadius: "10px",
        padding: "2rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        color: "#333",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>
        {/* Close Button X */}
        <button 
          style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#999" }} 
          onClick={() => nav("home")}
          aria-label="Close"
        >
          ✕
        </button>

        <h2 style={{ fontSize: "1.6rem", fontWeight: "700", marginBottom: "0.25rem", color: "#000" }}>
          {isLogin ? "Log in" : "Register"}
        </h2>
        
        <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.5rem" }}>
          {isLogin ? "New user? " : "Already registered? "}
          <span 
            style={{ color: "#0b57d0", cursor: "pointer", fontWeight: "600", textDecoration: "none" }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register Now" : "Log in here"}
          </span>
        </div>

        <button style={{ 
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", 
          padding: "0.65rem", background: "#f8f9fa", border: "1px solid #dadce0", borderRadius: "6px", 
          fontWeight: "500", color: "#3c4043", cursor: "pointer", fontSize: "0.9rem", transition: "background 0.2s" 
        }}>
          <GoogleIcon /> Continue with Google
        </button>


        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "#888", fontSize: "0.85rem" }}>
          <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }}></div>
          <span style={{ padding: "0 0.8rem", color: "#777" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e0e0e0" }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#222", fontWeight: 500 }}>Name</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="Your Full Name" 
                style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc", outline: "none", fontSize: "0.95rem" }} 
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#222", fontWeight: 500 }}>Username or Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="Username or Email" 
              style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #ccc", outline: "none", fontSize: "0.95rem" }} 
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.85rem", color: "#222", fontWeight: 500 }}>Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Enter password" 
                style={{ width: "100%", padding: "0.75rem", paddingRight: "2.5rem", borderRadius: "6px", border: "1px solid #ccc", outline: "none", fontSize: "0.95rem" }} 
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "0.75rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {showPwd ? <EyeOpen /> : <EyeClosed />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", color: "#555" }}>
                <input type="checkbox" style={{ cursor: "pointer", accentColor: "#0b57d0", width: "15px", height: "15px" }} /> Remember Me
              </label>
              <span style={{ color: "#0b57d0", cursor: "pointer", fontWeight: 500 }}>Forgot password</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={{ background: "#0c7847", color: "#fff", padding: "0.85rem", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "1rem", cursor: loading ? "wait" : "pointer", marginTop: "0.5rem", transition: "background 0.2s" }}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#888", marginTop: "1.5rem", lineHeight: "1.4" }}>
          By creating this account, you agree to our <span style={{ color: "#555", cursor: "pointer", fontWeight: 500 }}>Privacy Policy</span> & <span style={{ color: "#555", cursor: "pointer", fontWeight: 500 }}>Cookie Policy</span>.
        </div>

      </div>
    </div>
  );
}

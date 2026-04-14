import { useState } from "react";
import Navbar    from "./components/Navbar.jsx";
import Footer    from "./components/Footer.jsx";
import Cursor    from "./components/Cursor.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import Home      from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import About     from "./pages/About.jsx";
import Contact   from "./pages/Contact.jsx";
import Login     from "./pages/Login.jsx";
import "./index.css";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [visible, setVisible] = useState(true);
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(false);

  const navigate = (newPage) => {
    if (newPage === "login") {
      setShowLogin(true);
      return;
    }
    if (newPage === "dashboard" && !localStorage.getItem("token")) {
      setShowLogin(true);
      return;
    }
    if (newPage === page) return;
    setVisible(false);
    setTimeout(() => {
      setPage(newPage);
      setVisible(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  };

  const renderPage = () => {
    switch (page) {
      case "home":      return <Home      nav={navigate} />;
      case "dashboard": return <Dashboard />;
      case "about":     return <About     />;
      case "contact":   return <Contact   />;
      default:          return <Home      nav={navigate} />;
    }
  };

  return (
    <ToastProvider>
      <Cursor />
      <Navbar page={page} setPage={navigate} auth={auth} setAuth={setAuth} />
      <main style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .2s ease, transform .2s ease"
      }}>
        {renderPage()}
      </main>
      {showLogin && (
        <Login 
          setAuth={setAuth} 
          nav={(p) => {
            setShowLogin(false);
            if (p !== "home") navigate(p); 
          }} 
        />
      )}
      <Footer />
    </ToastProvider>
  );
}

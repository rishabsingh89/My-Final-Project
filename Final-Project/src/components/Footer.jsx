import s from "./Footer.module.css";

const LINKS = [
  { label: "Dashboard", page: "dashboard" },
  { label: "About",     page: "about"     },
  { label: "Contact",   page: "contact"   },
];

export default function Footer() {
  return (
    <footer className={s.f}>
      <div className={s.top}>
        <div className={s.brand}>
          <span className={s.dot} />
          <span className={s.name}>PredictiveSys</span>
        </div>
        <p className={s.tagline}>AI-Powered Inventory Intelligence — MERN Stack Final Project</p>
      </div>
      <div className={s.divider} />
      <div className={s.bottom}>
        <span>© 2026 PredictiveSys · Built with React, Node.js, MongoDB</span>
        <span className={s.r}>MERN Stack · AI-Powered · Real-Time</span>
      </div>
    </footer>
  );
}

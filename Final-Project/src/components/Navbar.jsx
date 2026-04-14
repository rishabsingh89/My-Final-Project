import s from"./Navbar.module.css";
const LINKS=[{id:"home",l:"Home"},{id:"dashboard",l:"Dashboard"},{id:"about",l:"About"},{id:"contact",l:"Contact"}];
export default function Navbar({page,setPage,auth,setAuth}){
  const handleAuthClick = () => {
    if (auth) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth(false);
      setPage("home");
    } else {
      setPage("login");
    }
  };

  return(
    <nav className={s.nav}>
      <button className={s.logo} onClick={()=>setPage("home")}>
        <span className={s.dot}/>PredictiveSys
      </button>
      <div className={s.links}>
        {LINKS.map(l=>(
          <button key={l.id} className={`${s.btn}${page===l.id?" "+s.active:""}`} onClick={()=>setPage(l.id)}>{l.l}</button>
        ))}
        {auth ? (
          <button className={s.pill} style={{ background: "transparent", border: "1px solid var(--rose)", color: "var(--rose)" }} onClick={handleAuthClick}>Logout</button>
        ) : (
          <button className={s.pill} onClick={handleAuthClick}>Login</button>
        )}
      </div>
    </nav>
  );
}

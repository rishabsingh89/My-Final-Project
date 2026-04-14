import s from"./Navbar.module.css";
const LINKS=[{id:"home",l:"Home"},{id:"dashboard",l:"Dashboard"},{id:"about",l:"About"},{id:"contact",l:"Contact"}];
export default function Navbar({page,setPage}){
  return(
    <nav className={s.nav}>
      <button className={s.logo} onClick={()=>setPage("home")}>
        <span className={s.dot}/>PredictiveSys
      </button>
      <div className={s.links}>
        {LINKS.map(l=>(
          <button key={l.id} className={`${s.btn}${page===l.id?" "+s.active:""}`} onClick={()=>setPage(l.id)}>{l.l}</button>
        ))}
        <button className={s.pill} onClick={()=>setPage("contact")}>Get Demo</button>
      </div>
    </nav>
  );
}

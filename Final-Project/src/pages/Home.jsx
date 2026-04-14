import { useEffect, useState, useRef } from "react";
import Counter from "../components/Counter.jsx";
import Simulator from "../components/Simulator.jsx";
import { PRODUCTS, FLOAT_CARDS } from "../data.js";
import s from "./Home.module.css";

function BarAnim(){
  const bars=[65,82,47,91,73,88,56,94,69,78];
  return(<svg viewBox="0 0 240 100" style={{width:"100%",height:"100%"}}>
    {bars.map((h,i)=>(<rect key={i} x={i*24+4} y={100-h} width="18" height={h} fill={i===7?"#b8ff57":i===2?"#f43f5e":"rgba(184,255,87,0.28)"} rx="3">
      <animate attributeName="height" from="0" to={h} dur="1.2s" begin={`${i*.07}s`} fill="freeze"/>
      <animate attributeName="y" from="100" to={100-h} dur="1.2s" begin={`${i*.07}s`} fill="freeze"/>
    </rect>))}
  </svg>);
}

function RadarAnim(){
  const pts=[[120,18],[210,75],[184,176],[56,176],[30,75]];
  const inn=pts.map(([x,y])=>[120+(x-120)*.52,100+(y-100)*.52]);
  return(<svg viewBox="0 0 240 200" style={{width:"100%",height:"100%"}}>
    {pts.map((p,i)=><line key={i} x1="120" y1="100" x2={p[0]} y2={p[1]} stroke="rgba(255,255,255,.07)" strokeWidth="1"/>)}
    <polygon points={pts.map(p=>p.join(",")).join(" ")} fill="rgba(184,255,87,.07)" stroke="rgba(184,255,87,.18)" strokeWidth="1"/>
    <polygon points={inn.map(p=>p.join(",")).join(" ")} fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.07)" strokeWidth="1"/>
    <polygon points="120,32 195,78 171,170 69,170 45,78" fill="rgba(139,92,246,.18)" stroke="#8b5cf6" strokeWidth="1.5">
      <animateTransform attributeName="transform" type="rotate" from="0 120 100" to="360 120 100" dur="12s" repeatCount="indefinite"/>
    </polygon>
    {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#b8ff57" opacity=".88">
      <animate attributeName="r" values="4;6;4" dur="2s" begin={`${i*.4}s`} repeatCount="indefinite"/>
    </circle>)}
    <text x="120" y="108" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.45)" fontFamily="JetBrains Mono,monospace">98.2% accuracy</text>
  </svg>);
}

function FlowAnim(){
  const[step,setStep]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setStep(s=>(s+1)%5),900);return()=>clearInterval(id);},[]);
  const nodes=[{x:24,l:"Data",c:"#22d3ee"},{x:82,l:"Parse",c:"#8b5cf6"},{x:140,l:"Predict",c:"#b8ff57"},{x:198,l:"Alert",c:"#f59e0b"},{x:256,l:"Act",c:"#06d6a0"}];
  return(<svg viewBox="0 0 280 60" style={{width:"100%",height:"100%"}}>
    {nodes.map((n,i)=>i<nodes.length-1&&<line key={i} x1={n.x+17} y1="30" x2={nodes[i+1].x-17} y2="30" stroke={i<step?nodes[i+1].c:"rgba(255,255,255,.09)"} strokeWidth="2" style={{transition:"stroke .4s"}}/>)}
    {nodes.map((n,i)=>(<g key={i}>
      <circle cx={n.x} cy="30" r="15" fill={i<=step?`${n.c}20`:"rgba(255,255,255,.03)"} stroke={i<=step?n.c:"rgba(255,255,255,.09)"} strokeWidth="1.5" style={{transition:"all .4s"}}/>
      <text x={n.x} y="35" textAnchor="middle" fontSize="8" fill={i<=step?n.c:"rgba(255,255,255,.2)"} fontFamily="JetBrains Mono,monospace" style={{transition:"fill .4s"}}>{n.l}</text>
    </g>))}
  </svg>);
}

const BENTO=[
  {icon:"◈",title:"Demand Forecasting",desc:"Moving average + trend models predict next-period demand with 98% accuracy from your sales history.",anim:<BarAnim/>,color:"var(--lime)",s2:false},
  {icon:"◉",title:"Prediction Pipeline",desc:"Raw data → actionable insight in milliseconds via our Node.js prediction engine.",anim:<FlowAnim/>,color:"var(--violet)",s2:false},
  {icon:"◆",title:"Smart Reordering",desc:"Automated purchase orders triggered when stock dips below dynamic safety thresholds.",anim:null,color:"var(--cyan)",s2:false},
  {icon:"◫",title:"Accuracy Engine — 98.2%",desc:"Continuously improving ML trained on every transaction, accounting for seasonality and trends.",anim:<RadarAnim/>,color:"var(--amber)",s2:true},
  {icon:"◷",title:"Seasonal Intelligence",desc:"Auto-detects spikes, promotions, and cyclical demand patterns across your entire catalogue.",anim:null,color:"var(--rose)",s2:false},
];

export default function Home({nav}){
  const heroRef = useRef(null);

  // Mouse parallax on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const move = (e) => {
      const { clientX, clientY } = e;
      const { width, height, left, top } = el.getBoundingClientRect();
      const x = (clientX - left - width / 2) / width;
      const y = (clientY - top - height / 2) / height;
      const orbs = el.querySelectorAll("[data-orb]");
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, []);

  return(
    <div className={`pg ${s.wrap}`}>
      <div className={s.gridBg}/>
      <section className={s.hero} ref={heroRef}>
        <div className={`${s.orb} ${s.o1}`} data-orb="1"/>
        <div className={`${s.orb} ${s.o2}`} data-orb="2"/>
        <div className={`${s.orb} ${s.o3}`} data-orb="3"/>
        <div className={s.eyebrow}><span className={s.edot}/>AI-Powered Inventory Intelligence · MERN Stack</div>
        <h1 className={s.h1}>Predict. Optimize.<br/><span className={s.hl}>Never</span> Run <span className={s.ou}>Out.</span></h1>
        <p className={s.sub}>An intelligent inventory system that forecasts stock demand using data-driven prediction logic — so your business always has exactly what it needs, when it needs it.</p>
        <div className={s.btns}>
          <button className={s.btnLime} onClick={()=>nav("dashboard")}>View Live Dashboard →</button>
          <button className={s.btnGhost} onClick={()=>nav("about")}>See How It Works</button>
        </div>
        <div className={s.metrics}>
          {[[98,"%","Prediction Accuracy"],[3,"×","Faster Restocking"],[40,"%","Cost Reduction"],[24,"/7","Live Monitoring"]].map(([n,sf,l])=>(
            <div className={s.mcard} key={l}><span className={s.mnum}><Counter target={n} suffix={sf}/></span><span className={s.mlbl}>{l}</span></div>
          ))}
        </div>
      </section>

      <div className={s.floatWrap}>
        {FLOAT_CARDS.map((c,i)=>(
          <div key={i} className={s.fcard} style={{left:`${c.l}px`,bottom:"-130px",animationDuration:`${c.dur}s`,animationDelay:`${c.delay}s`,"--r":`${(i%3-1)*4}deg`}}>
            <div className={s.fcName}>{c.name}</div>
            <div className={s.fcMeta}>{c.sku} · {c.stock} units</div>
            <div className={`${s.fcBadge} ${s[c.st]}`}>{c.st==="ok"?"✓ Healthy":c.st==="wn"?"⚠ Reorder":"✕ Critical"}</div>
          </div>
        ))}
      </div>

      <div className={s.ticker}>
        <div className={s.tickerInner}>
          {[...Array(2)].flatMap(()=>PRODUCTS.flatMap(p=>[
            <span className={s.titem} key={Math.random()}><strong>{p.sku}</strong>{p.name} · {p.stock} units · <span style={{color:p.st==="ok"?"var(--lime)":p.st==="wn"?"var(--amber)":"var(--rose)"}}>{p.st==="ok"?" ✓ OK":p.st==="wn"?" ⚠ Reorder":" ✕ Critical"}</span></span>
          ]))}
        </div>
      </div>

      <div className="sec">
        <span className="stag">// Core Features</span>
        <h2 className="sh">Everything you need to<br/><span style={{color:"var(--lime)"}}>master your inventory</span></h2>
        <p className="sp">PredictiveSys combines prediction logic with real-time tracking — all in pure MERN stack.</p>
        <div className={s.bento}>
          {BENTO.map((b,i)=>(
            <div className={`${s.bc}${b.s2?" "+s.s2:""}`} key={i}>
              {b.anim&&<div className={s.banim}>{b.anim}</div>}
              <div className={s.bicon} style={{color:b.color}}>{b.icon}</div>
              <div className={s.bh}>{b.title}</div>
              <div className={s.bp}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="sec" style={{paddingTop:0}}><Simulator/></div>
    </div>
  );
}

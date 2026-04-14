import{useState,useEffect,useRef}from"react";
export default function Counter({target,suffix=""}){
  const[v,setV]=useState(0);const ref=useRef(null);
  useEffect(()=>{
    const ob=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){let s=0;const step=target/60;
        const id=setInterval(()=>{s=Math.min(s+step,target);setV(Math.round(s));if(s>=target)clearInterval(id);},16);}
    },{threshold:.5});
    if(ref.current)ob.observe(ref.current);
    return()=>ob.disconnect();
  },[target]);
  return<span ref={ref}>{v}{suffix}</span>;
}

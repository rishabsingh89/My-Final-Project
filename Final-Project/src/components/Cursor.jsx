import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const hovering = useRef(false);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onEnter = () => {
      hovering.current = true;
      if (ring.current) ring.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) scale(2.2)`;
      if (ring.current) ring.current.style.opacity = "0.6";
    };
    const onLeave = () => {
      hovering.current = false;
      if (ring.current) ring.current.style.opacity = "1";
    };

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ring.current) {
        const scale = hovering.current ? 2.2 : 1;
        ring.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) scale(${scale})`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    const interactives = document.querySelectorAll("button, a, input, select, textarea, [data-hover]");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(animate);

    // Hide default cursor
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div ref={dot} style={{
        position: "fixed", top: 0, left: 0,
        width: 6, height: 6,
        background: "var(--lime)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        marginLeft: -3, marginTop: -3,
        transition: "background .2s",
        mixBlendMode: "difference"
      }}/>
      <div ref={ring} style={{
        position: "fixed", top: 0, left: 0,
        width: 32, height: 32,
        border: "1.5px solid rgba(184,255,87,.6)",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9998,
        marginLeft: -16, marginTop: -16,
        transition: "transform .08s linear, opacity .2s, scale .2s",
        willChange: "transform"
      }}/>
    </>
  );
}

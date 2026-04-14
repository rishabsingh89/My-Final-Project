import { useEffect, useRef } from "react";

export default function ParticleBg({ count = 28, color = "184,255,87" }) {
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, particles, raf;

    const resize = () => {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const init = () => {
      particles = Array.from({ length: count }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.2, 0.2), vy: rand(-0.3, -0.05),
        r: rand(0.8, 2.2),
        alpha: rand(0.1, 0.5),
        life: rand(0, 1)
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.life += 0.003;
        if (p.life > 1) { p.life = 0; p.x = rand(0, W); p.y = H + 10; p.alpha = rand(0.1, 0.5); }
        p.x += p.vx;
        p.y += p.vy;
        const a = p.alpha * Math.sin(p.life * Math.PI);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${a.toFixed(2)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    init();
    draw();
    window.addEventListener("resize", () => { resize(); init(); });

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count, color]);

  return (
    <canvas ref={canvas} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0
    }} />
  );
}

import { useEffect, useRef } from "react";

const KineticCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>();
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;
    document.documentElement.classList.add("kinetic-cursor");

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const el = e.target as HTMLElement | null;
      const interactive = !!el?.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor='hover']");
      dotRef.current?.classList.toggle("is-hover", interactive);
    };
    const onLeave = () => { target.current = { x: -200, y: -200 }; };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.22;
      current.current.y += (target.current.y - current.current.y) * 0.22;
      const dot = dotRef.current;
      if (dot) {
        const r = dot.offsetWidth / 2;
        dot.style.transform = `translate3d(${current.current.x - r}px, ${current.current.y - r}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove("kinetic-cursor");
    };
  }, []);

  return <div ref={dotRef} className="kinetic-cursor-dot" aria-hidden />;
};

export default KineticCursor;

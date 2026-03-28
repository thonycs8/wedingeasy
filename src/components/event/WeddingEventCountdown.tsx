import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface CountdownProps {
  weddingDate: string;
  themeColor: string;
}

export function WeddingEventCountdown({ weddingDate, themeColor }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const prevSeconds = useRef(timeLeft.seconds);
  const sectionRef = useScrollReveal();

  useEffect(() => {
    const target = new Date(weddingDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  useEffect(() => {
    prevSeconds.current = timeLeft.seconds;
  }, [timeLeft.seconds]);

  const units = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg", pulse: true },
  ];

  return (
    <section className="py-20 px-4 scroll-reveal" ref={sectionRef}>
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3 font-light">Faltam</p>
        <div className="flex justify-center gap-3 sm:gap-6">
          {units.map((u) => (
            <div key={u.label} className="flex flex-col items-center group">
              <div className="relative">
                {/* Glow effect behind */}
                <div
                  className="absolute inset-0 rounded-3xl blur-xl opacity-20 transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: themeColor }}
                />
                <div
                  className={`relative w-[72px] h-[88px] sm:w-[90px] sm:h-[110px] rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1 ${u.pulse ? "animate-digit-pulse" : ""}`}
                  style={{
                    background: `linear-gradient(145deg, ${themeColor}18, ${themeColor}08)`,
                    borderColor: `${themeColor}25`,
                  }}
                  key={u.pulse ? u.value : undefined}
                >
                  <span
                    className="text-3xl sm:text-4xl font-light tabular-nums"
                    style={{ color: themeColor }}
                  >
                    {String(u.value).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <span className="mt-3 text-[10px] sm:text-xs tracking-[0.15em] uppercase text-muted-foreground/70 font-light">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

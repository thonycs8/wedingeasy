import { useState, useEffect } from "react";

interface CountdownProps {
  weddingDate: string;
  themeColor: string;
}

export function WeddingEventCountdown({ weddingDate, themeColor }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  const units = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Minutos" },
    { value: timeLeft.seconds, label: "Segundos" },
  ];

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center text-foreground mb-8">Contagem Regressiva</h2>
      <div className="flex justify-center gap-4 sm:gap-8">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-foreground shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              {u.value}
            </div>
            <span className="mt-2 text-xs sm:text-sm text-muted-foreground">{u.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

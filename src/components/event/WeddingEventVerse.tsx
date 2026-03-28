import { Quote } from "lucide-react";

interface WeddingEventVerseProps {
  text: string;
  themeColor: string;
}

export function WeddingEventVerse({ text, themeColor }: WeddingEventVerseProps) {
  return (
    <section className="py-20 px-4 text-center">
      <div className="max-w-xl mx-auto relative">
        {/* Large decorative quote */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-[0.06]">
          <Quote className="w-32 h-32" style={{ color: themeColor }} />
        </div>

        <div className="relative">
          <div className="w-8 h-px mx-auto mb-8" style={{ backgroundColor: `${themeColor}40` }} />

          <blockquote className="text-xl sm:text-2xl italic text-foreground/70 leading-relaxed font-serif">
            {text}
          </blockquote>

          <div className="w-8 h-px mx-auto mt-8" style={{ backgroundColor: `${themeColor}40` }} />
        </div>
      </div>
    </section>
  );
}

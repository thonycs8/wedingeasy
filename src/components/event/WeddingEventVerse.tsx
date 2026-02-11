import { Quote } from "lucide-react";

interface WeddingEventVerseProps {
  text: string;
  themeColor: string;
}

export function WeddingEventVerse({ text, themeColor }: WeddingEventVerseProps) {
  return (
    <section className="py-12 px-4 text-center">
      <Quote className="w-8 h-8 mx-auto mb-4 opacity-30" style={{ color: themeColor }} />
      <blockquote className="max-w-lg mx-auto text-lg italic text-muted-foreground leading-relaxed font-serif">
        {text}
      </blockquote>
      <Quote className="w-8 h-8 mx-auto mt-4 opacity-30 rotate-180" style={{ color: themeColor }} />
    </section>
  );
}

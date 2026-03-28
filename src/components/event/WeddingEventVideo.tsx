import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface WeddingEventVideoProps {
  videoUrl: string;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function WeddingEventVideo({ videoUrl }: WeddingEventVideoProps) {
  const embedUrl = getEmbedUrl(videoUrl);
  const sectionRef = useScrollReveal();
  if (!embedUrl) return null;

  return (
    <section className="py-20 px-4 scroll-reveal" ref={sectionRef}>
      <div className="text-center mb-10">
        <Play className="w-5 h-5 mx-auto mb-3 text-muted-foreground/40" />
        <h2 className="text-3xl sm:text-4xl font-serif text-foreground">O Nosso Vídeo</h2>
      </div>
      <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-border/50">
        <AspectRatio ratio={16 / 9}>
          <iframe
            src={embedUrl}
            title="Vídeo do casamento"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            style={{ border: 0 }}
          />
        </AspectRatio>
      </div>
    </section>
  );
}

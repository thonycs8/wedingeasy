import { AspectRatio } from "@/components/ui/aspect-ratio";

interface WeddingEventVideoProps {
  videoUrl: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export function WeddingEventVideo({ videoUrl }: WeddingEventVideoProps) {
  const embedUrl = getEmbedUrl(videoUrl);
  if (!embedUrl) return null;

  return (
    <section className="py-12 px-4">
      <h2 className="text-2xl font-serif text-center text-foreground mb-6">O Nosso Vídeo</h2>
      <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-border">
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

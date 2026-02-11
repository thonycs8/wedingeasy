export interface CoverImage {
  id: string;
  url: string;
  thumbnail: string;
  label: string;
  category: string;
}

export const COVER_IMAGES: CoverImage[] = [
  {
    id: "romantic-bouquet",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=60",
    label: "Bouquet Romântico",
    category: "Romântico",
  },
  {
    id: "romantic-rings",
    url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=60",
    label: "Alianças",
    category: "Romântico",
  },
  {
    id: "romantic-kiss",
    url: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=60",
    label: "Casal ao Pôr do Sol",
    category: "Romântico",
  },
  {
    id: "rustic-barn",
    url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=60",
    label: "Celeiro Rústico",
    category: "Rústico",
  },
  {
    id: "rustic-flowers",
    url: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=60",
    label: "Flores do Campo",
    category: "Rústico",
  },
  {
    id: "classic-church",
    url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=60",
    label: "Cerimónia Clássica",
    category: "Clássico",
  },
  {
    id: "classic-venue",
    url: "https://images.unsplash.com/photo-1478146059778-acae64c33cdf?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1478146059778-acae64c33cdf?w=400&q=60",
    label: "Salão Elegante",
    category: "Clássico",
  },
  {
    id: "modern-minimal",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&q=60",
    label: "Decoração Moderna",
    category: "Moderno",
  },
  {
    id: "modern-city",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=60",
    label: "Casamento Urbano",
    category: "Moderno",
  },
  {
    id: "garden-outdoor",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=60",
    label: "Jardim ao Ar Livre",
    category: "Jardim",
  },
  {
    id: "garden-arch",
    url: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400&q=60",
    label: "Arco de Flores",
    category: "Jardim",
  },
  {
    id: "beach-sunset",
    url: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=400&q=60",
    label: "Pôr do Sol na Praia",
    category: "Praia",
  },
  {
    id: "beach-ceremony",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=60",
    label: "Cerimónia na Praia",
    category: "Praia",
  },
  {
    id: "romantic-dance",
    url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1400&q=80",
    thumbnail: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=60",
    label: "Primeira Dança",
    category: "Romântico",
  },
];

export function getCoverImagesByCategory(): Record<string, CoverImage[]> {
  return COVER_IMAGES.reduce<Record<string, CoverImage[]>>((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {});
}

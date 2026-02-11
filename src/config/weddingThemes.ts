export interface WeddingTheme {
  id: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  heroOverlay: string;
}

export const WEDDING_THEMES: WeddingTheme[] = [
  {
    id: "romantic",
    label: "Romântico",
    primaryColor: "#e11d48",
    secondaryColor: "#fda4af",
    fontFamily: "'Playfair Display', serif",
    heroOverlay: "linear-gradient(to bottom, rgba(225,29,72,0.7), rgba(253,164,175,0.5))",
  },
  {
    id: "rustic",
    label: "Rústico",
    primaryColor: "#92400e",
    secondaryColor: "#d97706",
    fontFamily: "'Lora', serif",
    heroOverlay: "linear-gradient(to bottom, rgba(146,64,14,0.7), rgba(217,119,6,0.4))",
  },
  {
    id: "classic",
    label: "Clássico",
    primaryColor: "#1e293b",
    secondaryColor: "#94a3b8",
    fontFamily: "'Cormorant Garamond', serif",
    heroOverlay: "linear-gradient(to bottom, rgba(30,41,59,0.75), rgba(148,163,184,0.4))",
  },
  {
    id: "modern",
    label: "Moderno",
    primaryColor: "#0f172a",
    secondaryColor: "#6366f1",
    fontFamily: "'Montserrat', sans-serif",
    heroOverlay: "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(99,102,241,0.5))",
  },
  {
    id: "garden",
    label: "Jardim",
    primaryColor: "#166534",
    secondaryColor: "#86efac",
    fontFamily: "'Libre Baskerville', serif",
    heroOverlay: "linear-gradient(to bottom, rgba(22,101,52,0.65), rgba(134,239,172,0.3))",
  },
  {
    id: "beach",
    label: "Praia",
    primaryColor: "#0369a1",
    secondaryColor: "#7dd3fc",
    fontFamily: "'Raleway', sans-serif",
    heroOverlay: "linear-gradient(to bottom, rgba(3,105,161,0.6), rgba(125,211,252,0.3))",
  },
];

export function getThemeById(id: string | null): WeddingTheme | null {
  if (!id) return null;
  return WEDDING_THEMES.find((t) => t.id === id) || null;
}

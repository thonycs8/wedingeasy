/** Minimal elegant ornament separator */
export function WeddingOrnament({ color = "currentColor" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 py-4" aria-hidden="true">
      <span className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to right, transparent, ${color}20)` }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 3L11.5 7H15L12.25 9.5L13.25 14L10 11.5L6.75 14L7.75 9.5L5 7H8.5L10 3Z"
          fill={color}
          opacity="0.12"
        />
      </svg>
      <span className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to left, transparent, ${color}20)` }} />
    </div>
  );
}

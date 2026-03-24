/** Decorative floral/heart ornament separator for the wedding landing page */
export function WeddingOrnament({ color = "currentColor" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6" aria-hidden="true">
      <span className="h-px w-12 bg-border" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14 24s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12z"
          fill={color}
          opacity="0.25"
        />
        <path
          d="M14 22s-7.5-4.5-7.5-10a4 4 0 0 1 7.5-2.5A4 4 0 0 1 21.5 12c0 5.5-7.5 10-7.5 10z"
          fill={color}
          opacity="0.5"
        />
      </svg>
      <span className="h-px w-12 bg-border" />
    </div>
  );
}

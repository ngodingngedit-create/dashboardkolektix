interface CardSkeletonProps {
  /** Jumlah card skeleton (default 4) */
  count?: number;
  /** Variant 'plain' = blok polos (merch grid), 'image' = gambar + baris teks (venue/blog card) */
  variant?: "plain" | "image";
  /** Tinggi card variant plain dalam px (default 256) */
  height?: number;
  /** Grid class Tailwind (default 4 kolom menyamai venue/merch) */
  className?: string;
}

/**
 * Skeleton grid card untuk halaman list (venue, blog, merch).
 * Pattern sama dengan merch/index & my-merchandise: animate-pulse.
 */
const CardSkeleton = ({
  count = 4,
  variant = "plain",
  height = 256,
  className = "grid grid-cols-1 md:grid-cols-4 gap-5 w-full",
}: CardSkeletonProps) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) =>
        variant === "image" ? (
          <div key={i} className="bg-white rounded-xl border border-primary-light-200 overflow-hidden">
            <div className="animate-pulse">
              <div className="bg-gray-200 w-full" style={{ aspectRatio: "16 / 9" }} />
              <div className="p-4 space-y-3">
                <div className="bg-gray-200 h-3 w-1/3 rounded-md" />
                <div className="bg-gray-200 h-5 w-2/3 rounded-md" />
                <div className="bg-gray-200 h-3 w-1/2 rounded-md" />
                <div className="bg-gray-200 h-8 w-24 rounded-lg mt-4" />
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="bg-gray-100 rounded-xl animate-pulse" style={{ height }} />
        )
      )}
    </div>
  );
};

export default CardSkeleton;

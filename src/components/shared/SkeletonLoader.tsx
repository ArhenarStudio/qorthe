interface SkeletonLoaderProps {
  isDarkMode: boolean;
  type?: "card" | "text" | "image" | "product" | "testimonial";
  count?: number;
}

export function SkeletonLoader({
  isDarkMode,
  type = "card",
  count = 1,
}: SkeletonLoaderProps) {
  const baseClass = `animate-pulse rounded-lg ${
    isDarkMode ? "bg-[#2d2419]" : "bg-gray-200"
  }`;

  const skeletons = Array.from({ length: count });

  if (type === "text") {
    return (
      <div className="space-y-3">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className={`h-4 ${baseClass}`}
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === "image") {
    return <div className={`aspect-video ${baseClass}`} />;
  }

  if (type === "product") {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((_, i) => (
          <div key={i} className="space-y-4">
            <div className={`aspect-square ${baseClass}`} />
            <div className={`h-6 ${baseClass}`} />
            <div className={`h-4 w-3/4 ${baseClass}`} />
            <div className={`h-8 w-1/2 ${baseClass}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "testimonial") {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {skeletons.map((_, i) => (
          <div
            key={i}
            className={`space-y-4 rounded-xl border p-6 ${
              isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full ${baseClass}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 w-3/4 ${baseClass}`} />
                <div className={`h-3 w-1/2 ${baseClass}`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className={`h-3 ${baseClass}`} />
              <div className={`h-3 ${baseClass}`} />
              <div className={`h-3 w-4/5 ${baseClass}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {skeletons.map((_, i) => (
        <div
          key={i}
          className={`rounded-xl border p-6 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="space-y-4">
            <div className={`h-6 w-3/4 ${baseClass}`} />
            <div className="space-y-2">
              <div className={`h-4 ${baseClass}`} />
              <div className={`h-4 ${baseClass}`} />
              <div className={`h-4 w-5/6 ${baseClass}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

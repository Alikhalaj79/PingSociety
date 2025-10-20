import Container from "@/components/Container";

export default function DashboardSkeleton() {
  return (
    <Container>
      <div className="py-8" dir="rtl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-end mb-4">
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-64 bg-white/20 rounded animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-white/20 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
                  </div>
                  <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Area Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white/5 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

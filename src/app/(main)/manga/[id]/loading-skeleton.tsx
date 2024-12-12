export default function MangaLoadingSkeleton() {
  return (
    <div className="relative mt-6 max-w-[1300px] mx-auto px-2">
      {/* Banner Image Skeleton */}
      <div className="relative w-full h-[400px] lg:h-[600px] rounded-t-lg overflow-hidden bg-gray-200 animate-pulse" />

      {/* Container xám bên dưới banner */}
      <div className="relative w-full h-[400px] lg:h-[200px] bg-gray-200 border-2 border-gray-300 py-4 lg:py-0">
        {/* Desktop Content Skeleton */}
        <div className="hidden lg:block">
          {/* Time Update Skeleton */}
          <div className="absolute left-[calc(18.4rem+2rem)] top-4">
            <div className="h-5 w-32 bg-gray-300 rounded animate-pulse" />
          </div>

          {/* Genres Skeleton */}
          <div className="absolute flex flex-wrap gap-2 left-[calc(18.4rem+2rem)] top-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-20 bg-gray-300 rounded-full animate-pulse"
              />
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="absolute flex items-center gap-3 left-[calc(18.4rem+2rem)] top-[120px]">
            <div className="h-9 w-32 bg-gray-300 rounded animate-pulse" />
            <div className="h-9 w-36 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Container trắng */}
      <div className="relative w-full h-[900px] bg-white border-2 border-gray-300 py-4 lg:py-0 rounded-b-lg">
        {/* Container xám */}
        <div className="w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 bg-gray-300 h-[30%] rounded-lg mt-6 opacity-70 animate-pulse" />

        {/* Scroll area skeleton */}
        <div className="w-[97%] mx-auto lg:w-[75%] lg:ml-4 lg:mx-0 mt-8 h-[60%] rounded-lg bg-gray-300 animate-pulse" />
      </div>

      {/* Cover Image Skeleton */}
      <div className="absolute lg:left-24 left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-[1400px] lg:bottom-[1100px] translate-y-1/2 z-20">
        <div className="relative w-32 lg:w-56 h-44 lg:h-80 rounded-lg bg-gray-300 animate-pulse" />
      </div>

      {/* Title & Author Skeleton - Mobile */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2 bottom-[780px] translate-y-1/2 z-10">
        <div className="text-center w-[250px] pt-[220px]">
          <div className="h-6 w-48 mx-auto bg-gray-300 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 mx-auto bg-gray-300 rounded animate-pulse" />
        </div>
      </div>

      {/* Title & Author Skeleton - Desktop */}
      <div className="absolute lg:left-[calc(19rem+2rem)] left-1/2 -translate-x-1/2 lg:translate-x-0 bottom-[570px] lg:bottom-[1150px] translate-y-1/2 z-10">
        <div className="hidden lg:block">
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mb-2" />
          <div className="h-7 w-64 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>

      {/* Mobile Content Skeleton */}
      <div className="lg:hidden">
        {/* Genres Skeleton */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[1190px] z-10 w-full">
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-20 bg-gray-300 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[1100px] sm:bottom-[1120px] z-10 w-full">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4">
            <div className="w-full sm:w-auto h-9 bg-gray-300 rounded animate-pulse" style={{ maxWidth: "200px" }} />
            <div className="w-full sm:w-auto h-9 bg-gray-300 rounded animate-pulse" style={{ maxWidth: "200px" }} />
          </div>
        </div>
      </div>
    </div>
  );
} 
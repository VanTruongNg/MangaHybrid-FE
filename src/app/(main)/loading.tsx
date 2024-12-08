import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MainLoading() {
  return (
    <div className="relative min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative w-full h-[65vh] -mt-[64px]">
        <Skeleton className="absolute inset-0 brightness-75" />
      </div>

      {/* Carousel Skeleton */}
      <div className="absolute left-1/2 top-[65vh] -translate-x-1/2 -translate-y-[80%] w-full">
        <div className="w-full px-4">
          {/* Main Carousel Item */}
          <div className="flex-[0_0_90%] md:flex-[0_0_70%] mx-auto">
            <div className="relative aspect-[21/10] overflow-hidden rounded-xl">
              <Skeleton className="w-full h-full" />
              {/* Gradient overlay */}
              <div className="absolute inset-0 z-[20] bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[30]">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-7 w-1/3" /> {/* Title */}
                  <Skeleton className="h-4 w-2/5" /> {/* Description */}
                </div>
                <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8">
                  <Skeleton className="w-32 h-10 rounded-lg" /> {/* Button */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="relative z-[100] mt-8">
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={cn(
                  "h-2 rounded-full",
                  i === 0 ? "w-6" : "w-2"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="pt-[80vh] space-y-8 p-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
} 
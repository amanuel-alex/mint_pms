import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({ 
  className, 
  count = 1, 
  height = "h-4", 
  width = "w-full" 
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200 rounded",
            height,
            width,
            className
          )}
        />
      ))}
    </>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-xl shadow-sm", className)}>
      <LoadingSkeleton className="w-32 h-6 mb-4" />
      <div className="space-y-3">
        <LoadingSkeleton />
        <LoadingSkeleton className="w-3/4" />
        <LoadingSkeleton className="w-1/2" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <LoadingSkeleton className="w-64 h-8 mb-2" />
              <LoadingSkeleton className="w-96 h-4" />
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <LoadingSkeleton className="w-32 h-6 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <LoadingSkeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <LoadingSkeleton className="w-1/4" />
                <LoadingSkeleton className="w-1/2" />
              </div>
              <LoadingSkeleton className="w-20 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-start">
          <LoadingSkeleton className="w-32 h-6" />
          <LoadingSkeleton className="w-20 h-6" />
        </div>
        <LoadingSkeleton className="w-full h-4" />
        <LoadingSkeleton className="w-3/4 h-4" />
        <div className="space-y-2">
          <LoadingSkeleton className="w-24 h-4" />
          <LoadingSkeleton className="w-32 h-4" />
          <LoadingSkeleton className="w-28 h-4" />
        </div>
      </div>
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between items-start">
          <LoadingSkeleton className="w-40 h-5" />
          <LoadingSkeleton className="w-16 h-5" />
        </div>
        <LoadingSkeleton className="w-full h-4" />
        <div className="flex items-center space-x-4">
          <LoadingSkeleton className="w-8 h-8 rounded-full" />
          <LoadingSkeleton className="w-24 h-4" />
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-start gap-3">
          <LoadingSkeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="w-full h-4" />
            <LoadingSkeleton className="w-3/4 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
} 
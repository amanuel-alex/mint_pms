export default function Loading() {
  return (
    <div className="p-6">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    </div>
  );
}



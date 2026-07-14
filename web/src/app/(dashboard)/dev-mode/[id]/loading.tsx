export default function Loading() {
    return (
      <div className="space-y-6 p-6">
  
        <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
  
        <div className="grid gap-6 lg:grid-cols-4">
  
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-muted"
            />
          ))}
  
        </div>
  
        <div className="h-[500px] animate-pulse rounded-2xl bg-muted" />
  
      </div>
    )
  }
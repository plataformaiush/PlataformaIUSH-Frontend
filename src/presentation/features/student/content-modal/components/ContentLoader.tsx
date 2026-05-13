export function ContentLoader() {
  return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-5 bg-mid/30 rounded-lg w-3/4" />
      <div className="aspect-video bg-mid/20 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 bg-mid/20 rounded w-full" />
        <div className="h-3 bg-mid/20 rounded w-5/6" />
        <div className="h-3 bg-mid/20 rounded w-4/6" />
      </div>
    </div>
  )
}

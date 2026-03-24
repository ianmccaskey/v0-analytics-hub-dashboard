export function Loader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-1 w-64 overflow-hidden rounded-full bg-muted">
        <div
          className="pulse-loader h-full bg-gradient-to-r from-[#18F2C4] to-[#3DA5FF]"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

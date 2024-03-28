type SkeletonProps = {
  delay?: 0 | 75 | 100 | 150
}
const Skeleton: React.FC<SkeletonProps> = ({ delay = 0 }) => {
  return (
    <div
      className={`border border-slate-200 shadow rounded-md py-4 px-2 w-full mx-auto
      ${delay !== 0 && `delay-${delay}`}
    `}>
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-6 py-1">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-300 rounded col-span-3"></div>
              <div className="h-2 bg-slate-300 rounded col-span-2"></div>
              <div className="h-2 bg-slate-300 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton

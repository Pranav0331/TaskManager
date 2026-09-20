const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variants = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    text: 'rounded h-4',
  };

  return <div className={`skeleton ${variants[variant]} ${className}`} />;
};

export const StatCardSkeleton = () => (
  <div className="nimbus-card p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-3 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton variant="circle" className="w-12 h-12" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr>
    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
    <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
    <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
  </tr>
);

export const NoteCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-nimbus-200/80 dark:border-nimbus-800/60 bg-white/60 dark:bg-nimbus-900/40 flex flex-col justify-between shadow-2xs min-h-[168px]">
    <div>
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-nimbus-200/40 dark:border-nimbus-700/30">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-1">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="w-5 h-5 rounded-md" />
        </div>
      </div>
      <div className="space-y-2 my-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-nimbus-200/40 dark:border-nimbus-700/30">
      <div className="flex items-center gap-1.5">
        <Skeleton variant="circle" className="w-2 h-2" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton variant="circle" className="w-3 h-3" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  </div>
);

export default Skeleton;

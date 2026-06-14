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
    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
    <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
  </tr>
);

export default Skeleton;

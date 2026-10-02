import Skeleton from "./Skeleton.jsx";

const ProductCardSkeleton = () => (
  <div className="border rounded-lg overflow-hidden">
    <Skeleton className="w-full aspect-square" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  </div>
);

export default ProductCardSkeleton;
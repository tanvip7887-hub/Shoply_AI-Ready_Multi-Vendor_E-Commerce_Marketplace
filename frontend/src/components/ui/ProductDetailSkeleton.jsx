import Skeleton from "./Skeleton.jsx";

const ProductDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-10">
    <Skeleton className="w-full aspect-square" />
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-12 w-1/2" />
    </div>
  </div>
);

export default ProductDetailSkeleton;
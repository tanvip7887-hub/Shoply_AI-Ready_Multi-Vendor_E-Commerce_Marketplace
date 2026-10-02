import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { productApi } from "../../api/product.api.js";
import Button from "../../components/ui/Button.jsx";

const statusBadge = {
    ACTIVE: "bg-green-100 text-green-700",
    DISABLED: "bg-gray-200 text-gray-500",
    OUT_OF_STOCK: "bg-red-100 text-red-700",
    DELETED: "bg-red-100 text-red-700",
};

const SellerProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        productApi.getById(id).then((res) => {
            // Note: getById doesn't return computedStatus directly if it's not from getMine, but we can compute it here or assume the backend does.
            // Wait, actually, let's fetch it using getMine so we have availability logic, or manually compute it.
            // The getById in product.service.js doesn't use withAvailability. Let's just fetch it anyway.
            setProduct(res.data);
        }).catch(() => { }).finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="text-gray-500 flex justify-center py-10">Loading product details...</div>;
    if (!product) return <div className="text-gray-500 flex justify-center py-10">Product not found.</div>;

    const discountPercent = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : null;

    // We compute status locally just in case getById didn't include it.
    const stock = product.inventory?.stock ?? 0;
    const reserved = product.inventory?.reservedStock ?? 0;
    const available = stock - reserved;
    const computedStatus = product.isDeleted ? "DELETED" : !product.isActive ? "DISABLED" : available <= 0 ? "OUT_OF_STOCK" : "ACTIVE";

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between mb-6">
                <Link to="/seller/products" className="text-sm font-medium text-gray-500 hover:text-brand-600 flex items-center gap-1">
                    ← Back to Products
                </Link>
                <Link to={`/seller/products/${product.id}/edit`}>
                    <Button>Edit Product</Button>
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                    {/* Image Gallery */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4">
                        <div className="aspect-square bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                            <img 
                                src={product.images?.[0]?.url || "https://placehold.co/400x400?text=No+Image"} 
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.slice(1).map((img) => (
                                    <img key={img.id} src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200 shrink-0" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="w-full md:w-2/3 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span className="font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">SKU: {product.sku}</span>
                                    <span>•</span>
                                    <span>{product.category?.name}</span>
                                    {product.brand?.name && (
                                        <>
                                            <span>•</span>
                                            <span>{product.brand.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    product.approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                                    product.approvalStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                                    "bg-blue-100 text-blue-700"
                                }`}>
                                    {product.approvalStatus}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadge[computedStatus]}`}>
                                    {computedStatus}
                                </span>
                            </div>
                        </div>

                        {product.approvalStatus === 'REJECTED' && product.rejectionReason && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                                <strong className="block mb-1 font-bold">Product Rejected</strong>
                                {product.rejectionReason}
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-5 mb-6 flex items-end gap-4">
                            <div>
                                <p className="text-xs text-gray-500 font-medium mb-1">Selling Price</p>
                                <p className="text-2xl font-bold text-gray-900">₹{product.discountPrice || product.price}</p>
                            </div>
                            {product.discountPrice && (
                                <>
                                    <div className="pb-1">
                                        <p className="text-sm text-gray-400 line-through">₹{product.price}</p>
                                    </div>
                                    <div className="pb-1">
                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                            {discountPercent}% OFF
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 border-t border-b border-gray-100 py-6">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Available Stock</p>
                                <p className="text-gray-900 font-medium">{available} units</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Seller</p>
                                <p className="text-gray-900 font-medium">{product.seller?.businessName || "You"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Active Status</p>
                                <p className="text-gray-900 font-medium">{product.isActive ? "Yes" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shipping Weight</p>
                                <p className="text-gray-900 font-medium">{product.weight ? `${product.weight} kg` : "—"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Dimensions (L×W×H)</p>
                                <p className="text-gray-900 font-medium">
                                    {product.length && product.width && product.height ? `${product.length}×${product.width}×${product.height} cm` : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                                <p className="text-gray-900 font-medium">{new Date(product.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Product Description</h3>
                            <div className="prose prose-sm max-w-none text-gray-600">
                                {product.description ? (
                                    <p className="whitespace-pre-wrap">{product.description}</p>
                                ) : (
                                    <p className="italic text-gray-400">No description provided.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerProductDetailPage;
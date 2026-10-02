import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MoveLeft, MoveRight, X } from "lucide-react";
import { productApi } from "../../api/product.api.js";
import { categoryApi } from "../../api/category.api.js";
import { brandApi } from "../../api/brand.api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

const SellerProductFormPage = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    
    // unified image state: { type: 'existing', id: Number, url: String } OR { type: 'new', file: File, url: String, localId: String }
    const [allImages, setAllImages] = useState([]);
    const [originalImageIds, setOriginalImageIds] = useState([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEdit);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        categoryApi.getAll().then((res) => setCategories(res.data)).catch(() => { });
        brandApi.getAll({ isActive: "true" }).then((res) => setBrands(res.data)).catch(() => { });
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        productApi.getById(id).then((res) => {
            const p = res.data;
            reset({
                name: p.name, categoryId: p.categoryId, brandId: p.brandId || "",
                description: p.description || "", price: p.price, discountPrice: p.discountPrice || "",
                weight: p.weight || "", length: p.length || "", width: p.width || "", height: p.height || "",
            });
            // Ensure they are sorted by sortOrder (backend returns them sorted)
            const imgs = p.images || [];
            setAllImages(imgs.map(img => ({ type: 'existing', id: img.id, url: img.url })));
            setOriginalImageIds(imgs.map(img => img.id));
        }).catch(() => { }).finally(() => setIsLoading(false));
    }, [id]);

    const onSubmit = async (data) => {
        setIsSaving(true);
        try {
            const payload = {
                ...data,
                categoryId: Number(data.categoryId),
                brandId: data.brandId ? Number(data.brandId) : undefined,
                price: Number(data.price),
                discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
                weight: data.weight ? Number(data.weight) : undefined,
                length: data.length ? Number(data.length) : undefined,
                width: data.width ? Number(data.width) : undefined,
                height: data.height ? Number(data.height) : undefined,
            };

            if (allImages.length === 0) {
                toast.error("Please add at least one image");
                setIsSaving(false);
                return;
            }

            let productId = id;
            if (isEdit) {
                await productApi.update(id, payload);
            } else {
                const res = await productApi.create(payload);
                productId = res.data.id;
            }

            // Extract new files to upload
            const newImages = allImages.filter(img => img.type === 'new');
            let updatedProduct = null;
            if (newImages.length > 0) {
                const form = new FormData();
                newImages.forEach((img) => form.append("images", img.file));
                const res = await productApi.addImages(productId, form);
                updatedProduct = res.data;
            }

            // Now, compute the final ID order for sorting
            // If we uploaded new images, the backend appended them. The backend returns all images in updatedProduct.
            // We need to match the new files to the newly created DB images.
            // Since they are uploaded in the exact order we appended them to FormData, their IDs in the DB 
            // (the ones not present in allImages initially) will be in the same order.
            
            let finalImageIds = [];
            if (updatedProduct && newImages.length > 0) {
                const existingDbIds = allImages.filter(img => img.type === 'existing').map(img => img.id);
                const newlyCreatedDbImages = updatedProduct.images.filter(img => !existingDbIds.includes(img.id));
                
                let newIndex = 0;
                finalImageIds = allImages.map(img => {
                    if (img.type === 'existing') return img.id;
                    const dbImg = newlyCreatedDbImages[newIndex++];
                    return dbImg ? dbImg.id : null;
                }).filter(Boolean);
            } else {
                finalImageIds = allImages.map(img => img.id);
            }

            // Finally, send the reorder request
            const orderChanged = JSON.stringify(finalImageIds) !== JSON.stringify(originalImageIds);
            if (finalImageIds.length > 0 && orderChanged) {
                await productApi.reorderImages(productId, { imageIds: finalImageIds });
            }

            toast.success(isEdit ? "Product updated successfully." : "Product created successfully.");
            navigate("/seller/products");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to create product.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const newImgs = files.map(file => ({
            type: 'new',
            file,
            url: URL.createObjectURL(file),
            localId: Math.random().toString(36).substr(2, 9)
        }));
        setAllImages(prev => [...prev, ...newImgs]);
    };

    const handleRemove = async (index) => {
        const img = allImages[index];
        if (img.type === 'existing') {
            try {
                await productApi.removeImage(id, img.id);
                toast.success("Image removed");
            } catch (err) {
                return; // stop if removal fails
            }
        } else {
            URL.revokeObjectURL(img.url);
        }
        setAllImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleMove = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === allImages.length - 1)) return;
        const newImages = [...allImages];
        const temp = newImages[index];
        newImages[index] = newImages[index + direction];
        newImages[index + direction] = temp;
        setAllImages(newImages);
    };

    if (isLoading) return <div className="text-gray-500">Loading...</div>;

    return (
        <div className="max-w-3xl pb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? "Edit Product" : "Add Product"}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900">Basic Information</h2>
                    <Input label="Product Name" {...register("name", { required: "Name is required" })} error={errors.name?.message} />

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select {...register("categoryId", { required: "Category is required" })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                                <option value="">Select category</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Brand (optional)</label>
                            <select {...register("brandId")} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
                                <option value="">No brand</option>
                                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register("description")} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900">Pricing</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Price (₹)"
                            type="number"
                            step="0.01"
                            {...register("price", { required: "Price is required", min: { value: 0.01, message: "Price must be greater than 0" } })}
                            error={errors.price?.message}
                        />
                        <Input
                            label="Discount Price (₹, optional)"
                            type="number"
                            step="0.01"
                            {...register("discountPrice")}
                            error={errors.discountPrice?.message}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900">Shipping</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Weight (kg)" type="number" step="0.01" {...register("weight")} />
                        <Input label="Length (cm)" type="number" step="0.01" {...register("length")} />
                        <Input label="Width (cm)" type="number" step="0.01" {...register("width")} />
                        <Input label="Height (cm)" type="number" step="0.01" {...register("height")} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900">Images</h2>
                        <label className="inline-block px-3 py-1.5 bg-brand-50 text-sm text-brand-700 font-medium rounded-md cursor-pointer hover:bg-brand-100 transition-base">
                            + Add Images
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                        </label>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">Drag or use arrows to reorder. The first image will be the main thumbnail.</p>

                    {allImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {allImages.map((img, index) => (
                                <div key={img.id || img.localId} className="relative group rounded-lg border border-gray-200 bg-gray-50 overflow-hidden aspect-square flex flex-col">
                                    <div className="flex-1 relative">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        {index === 0 && (
                                            <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase">Main</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(index)}
                                            className="absolute top-2 right-2 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remove Image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="h-8 bg-white border-t border-gray-200 flex items-center justify-between px-2">
                                        <button 
                                            type="button" 
                                            onClick={() => handleMove(index, -1)} 
                                            disabled={index === 0}
                                            className="p-1 text-gray-500 hover:text-brand-600 disabled:opacity-30 transition-colors"
                                        >
                                            <MoveLeft size={16} />
                                        </button>
                                        <span className="text-xs text-gray-400">{index + 1}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleMove(index, 1)} 
                                            disabled={index === allImages.length - 1}
                                            className="p-1 text-gray-500 hover:text-brand-600 disabled:opacity-30 transition-colors"
                                        >
                                            <MoveRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 text-sm">No images added yet.</p>
                        </div>
                    )}
                </div>

                {isEdit && (
                    <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100">
                        <strong>Note:</strong> Editing this product will automatically resubmit it for moderation review. It will not be visible to customers until approved again.
                    </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={() => navigate("/seller/products")} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSaving} className="flex-1">
                        {isEdit ? "Save Changes" : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SellerProductFormPage;
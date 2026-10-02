import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { categoryApi } from "../../api/category.api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

const emptyForm = { name: "", description: "", parentId: "" };

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const load = () => {
        setIsLoading(true);
        categoryApi.getAll().then((res) => setCategories(res.data)).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(load, []);

    const topLevel = categories.filter((c) => !c.parentId);
    const flatWithChildren = topLevel.flatMap((parent) => [
        parent,
        ...categories.filter((c) => c.parentId === parent.id),
    ]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description || "", parentId: cat.parentId || "" });
        setShowModal(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                parentId: form.parentId ? Number(form.parentId) : undefined,
            };
            if (editing) {
                await categoryApi.update(editing.id, payload);
                toast.success("Category updated");
            } else {
                await categoryApi.create(payload);
                toast.success("Category created");
            }
            setShowModal(false);
            load();
        } catch (err) {
            // interceptor toasts
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (cat) => {
        try {
            await categoryApi.update(cat.id, { isActive: !cat.isActive });
            toast.success(cat.isActive ? "Category disabled" : "Category enabled");
            load();
        } catch (err) {
            // interceptor toasts
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete "${cat.name}"? This only works if it has no subcategories.`)) return;
        try {
            await categoryApi.delete(cat.id);
            toast.success("Category deleted");
            load();
        } catch (err) {
            // interceptor toasts the "has subcategories" 409 if that's the case
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Categories</h1>
                    <p className="text-sm text-gray-400">Manage product categories and subcategories</p>
                </div>
                <Button onClick={openCreate}>+ New Category</Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-t"><td colSpan={4} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                            ))}
                        {!isLoading && flatWithChildren.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No categories yet</td></tr>
                        )}
                        {!isLoading &&
                            flatWithChildren.map((cat) => (
                                <tr key={cat.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">
                                        {cat.parentId ? <span className="text-gray-300 mr-2">└</span> : null}
                                        {cat.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                            {cat.isActive ? "ACTIVE" : "DISABLED"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-3 text-xs">
                                        <button onClick={() => openEdit(cat)} className="text-brand-600 font-medium hover:underline">Edit</button>
                                        <button onClick={() => handleToggleActive(cat)} className="text-gray-500 font-medium hover:underline">
                                            {cat.isActive ? "Disable" : "Enable"}
                                        </button>
                                        <button onClick={() => handleDelete(cat)} className="text-red-600 font-medium hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="font-semibold mb-4">{editing ? "Edit Category" : "New Category"}</h3>
                        <div className="space-y-4">
                            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Parent Category (optional)</label>
                                <select
                                    value={form.parentId}
                                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">None (top-level)</option>
                                    {topLevel.filter((c) => c.id !== editing?.id).map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleSave} isLoading={isSaving} className="flex-1">Save</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
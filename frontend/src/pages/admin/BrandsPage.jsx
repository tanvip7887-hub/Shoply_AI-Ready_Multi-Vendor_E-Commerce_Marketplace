import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { brandApi } from "../../api/brand.api.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

const emptyForm = { name: "", logo: "" };

const BrandsPage = () => {
    const [brands, setBrands] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const load = () => {
        setIsLoading(true);
        brandApi.getAll().then((res) => setBrands(res.data)).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(load, []);

    const filtered = brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (brand) => {
        setEditing(brand);
        setForm({ name: brand.name, logo: brand.logo || "" });
        setShowModal(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { name: form.name, logo: form.logo || undefined };
            if (editing) {
                await brandApi.update(editing.id, payload);
                toast.success("Brand updated");
            } else {
                await brandApi.create(payload);
                toast.success("Brand created");
            }
            setShowModal(false);
            load();
        } catch (err) {
            // interceptor toasts (e.g. duplicate name 409)
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (brand) => {
        try {
            await brandApi.updateStatus(brand.id, !brand.isActive);
            toast.success(brand.isActive ? "Brand disabled" : "Brand enabled");
            load();
        } catch (err) {
            // interceptor toasts
        }
    };

    const handleDelete = async (brand) => {
        if (!window.confirm(`Delete "${brand.name}"? This only works if no products reference it.`)) return;
        try {
            await brandApi.delete(brand.id);
            toast.success("Brand deleted");
            load();
        } catch (err) {
            // interceptor toasts the "has products" 409 if that's the case
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Brands</h1>
                    <p className="text-sm text-gray-400">Manage product brands</p>
                </div>
                <Button onClick={openCreate}>+ New Brand</Button>
            </div>

            <input
                type="text"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64 mb-4"
            />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                        <tr>
                            <th className="px-4 py-3">Logo</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i} className="border-t"><td colSpan={5} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                            ))}
                        {!isLoading && filtered.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No brands found</td></tr>
                        )}
                        {!isLoading &&
                            filtered.map((brand) => (
                                <tr key={brand.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {brand.logo ? (
                                            <img src={brand.logo} alt="" className="w-10 h-10 rounded object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                                {brand.name[0]}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{brand.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${brand.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                                            {brand.isActive ? "ACTIVE" : "DISABLED"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 space-x-3 text-xs">
                                        <button onClick={() => openEdit(brand)} className="text-brand-600 font-medium hover:underline">Edit</button>
                                        <button onClick={() => handleToggleActive(brand)} className="text-gray-500 font-medium hover:underline">
                                            {brand.isActive ? "Disable" : "Enable"}
                                        </button>
                                        <button onClick={() => handleDelete(brand)} className="text-red-600 font-medium hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="font-semibold mb-4">{editing ? "Edit Brand" : "New Brand"}</h3>
                        <div className="space-y-4">
                            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            <Input
                                label="Logo URL (optional placeholder)"
                                value={form.logo}
                                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                placeholder="https://..."
                            />
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

export default BrandsPage;
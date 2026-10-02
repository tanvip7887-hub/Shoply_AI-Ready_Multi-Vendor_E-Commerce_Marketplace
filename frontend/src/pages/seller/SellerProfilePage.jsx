import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { sellerProfileApi } from "../../api/sellerProfile.api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Skeleton from "../../components/ui/Skeleton.jsx";

const statusColor = { VERIFIED: "bg-green-100 text-green-700", SUSPENDED: "bg-red-100 text-red-700" };

const SellerProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const load = () => {
        sellerProfileApi.getMine().then((res) => {
            setProfile(res.data);
            reset({
                ownerName: res.data.ownerName,
                mobileNumber: res.data.mobileNumber,
                businessName: res.data.businessName,
                displayName: res.data.displayName,
                gstNumber: res.data.gstNumber || "",
                panNumber: res.data.panNumber || "",
                address: {
                    addressLine1: res.data.address?.addressLine1 || "",
                    city: res.data.address?.city || "",
                    state: res.data.address?.state || "",
                    postalCode: res.data.address?.postalCode || "",
                },
            });
        }).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(load, []);

    const onSave = async (data) => {
        setIsSaving(true);
        try {
            const res = await sellerProfileApi.update(data);
            setProfile(res.data);
            toast.success("Profile updated");
            setIsEditing(false);
        } catch (err) {
            // interceptor toasts validation errors
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        const form = new FormData();
        form.append("avatar", file);
        try {
            const res = await sellerProfileApi.uploadAvatar(form);
            setProfile(res.data);
            toast.success("Profile picture updated");
        } catch (err) {
            // interceptor toasts
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    if (isLoading) {
        return <div className="space-y-4"><Skeleton className="h-64 w-full rounded-xl" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Seller Profile</h1>
            <p className="text-sm text-gray-400 mb-6">Manage your personal and business information</p>

            <form onSubmit={handleSubmit(onSave)} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>

                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                            <img
                                src={profile.avatar || "https://placehold.co/80x80?text=Avatar"}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-4 border-brand-50"
                            />
                            <label className="absolute bottom-0 right-0 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-brand-700 transition-base">
                                {isUploadingAvatar ? "..." : "Edit"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                            </label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Full Name" disabled={!isEditing} {...register("ownerName")} error={errors.ownerName?.message} />
                        <Input label="Email" value={profile.email} disabled className="bg-gray-50" />
                        <Input label="Mobile Number" disabled={!isEditing} {...register("mobileNumber")} error={errors.mobileNumber?.message} />
                    </div>
                </div>

                {/* Business Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Business Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Business Name" disabled={!isEditing} {...register("businessName")} error={errors.businessName?.message} />
                        <Input label="Display Store Name" disabled={!isEditing} {...register("displayName")} error={errors.displayName?.message} />
                        <Input label="GST Number" disabled={!isEditing} {...register("gstNumber")} />
                        <Input label="PAN Number" disabled={!isEditing} {...register("panNumber")} />
                    </div>
                </div>

                {/* Pickup Address */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Pickup Address</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Input label="Address" disabled={!isEditing} {...register("address.addressLine1")} error={errors.address?.addressLine1?.message} />
                        </div>
                        <Input label="City" disabled={!isEditing} {...register("address.city")} error={errors.address?.city?.message} />
                        <Input label="State" disabled={!isEditing} {...register("address.state")} error={errors.address?.state?.message} />
                        <Input label="Pincode" disabled={!isEditing} {...register("address.postalCode")} error={errors.address?.postalCode?.message} />
                    </div>
                </div>

                {/* Account Information (read-only) */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Account Information</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <p><span className="text-gray-500 block text-xs">Seller ID</span> {profile.sellerId}</p>
                        <p><span className="text-gray-500 block text-xs">Joined Date</span> {new Date(profile.joinedDate).toLocaleDateString()}</p>
                        <p>
                            <span className="text-gray-500 block text-xs">Seller Status</span>
                            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${statusColor[profile.status]}`}>
                                {profile.status}
                            </span>
                        </p>
                    </div>
                </div>

                {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button type="button" variant="secondary" onClick={() => { load(); setIsEditing(false); }} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSaving} className="flex-1">
                            Save Changes
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SellerProfilePage;
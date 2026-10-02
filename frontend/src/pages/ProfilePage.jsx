import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { userApi } from "../api/user.api.js";
import { updateUserProfile } from "../store/slices/authSlice.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";

const ProfilePage = () => {
    const dispatch = useDispatch();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const load = () => {
        userApi.getMe().then((res) => {
            setProfile(res.data);
            reset({
                name: res.data.name,
                phone: res.data.phone || "",
                gender: res.data.gender || "",
                dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.slice(0, 10) : "",
            });
        }).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(load, []);

    const onSave = async (data) => {
        setIsSaving(true);
        try {
            const res = await userApi.updateMe(data);
            setProfile(res.data);
            dispatch(updateUserProfile({ name: res.data.name })); // navbar reflects new name immediately
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
            const res = await userApi.uploadAvatar(form);
            setProfile(res.data);
            toast.success("Profile picture updated");
        } catch (err) {
            // interceptor toasts
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleCancel = () => {
        reset({
            name: profile.name,
            phone: profile.phone || "",
            gender: profile.gender || "",
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
        });
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="max-w-lg mx-auto px-4 py-12">
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <img
                            src={profile.avatar || "https://placehold.co/120x120?text=Avatar"}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover border-4 border-brand-50"
                        />
                        <label className="absolute bottom-0 right-0 bg-brand-600 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-brand-700 transition-base">
                            {isUploadingAvatar ? "..." : "Edit"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                        </label>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mt-4">{profile.name}</h1>
                    <p className="text-sm text-gray-400">{profile.email}</p>
                </div>

                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <Input label="Full Name" disabled={!isEditing} {...register("name")} error={errors.name?.message} />
                    <Input label="Email Address" value={profile.email} disabled className="bg-gray-50" />
                    <Input label="Mobile Number" disabled={!isEditing} {...register("phone")} error={errors.phone?.message} />

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            {...register("gender")}
                            disabled={!isEditing}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        >
                            <option value="">Select gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            {...register("dateOfBirth")}
                            disabled={!isEditing}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    {!isEditing ? (
                        <Button type="button" onClick={() => setIsEditing(true)} className="w-full">
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={isSaving} className="flex-1">
                                Save
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
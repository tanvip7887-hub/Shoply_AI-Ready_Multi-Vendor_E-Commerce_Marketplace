import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { sellerPayoutApi } from "../../api/sellerPayout.api.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";

const PayoutSetupPage = () => {
    const [bankAccount, setBankAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const load = () => {
        sellerPayoutApi.getMine().then((res) => {
            setBankAccount(res.data);
            setIsEditing(!res.data); // no account yet -> show the form immediately
        }).catch(() => { }).finally(() => setIsLoading(false));
    };

    useEffect(load, []);

    const onSave = async (data) => {
        setIsSaving(true);
        try {
            await sellerPayoutApi.save(data);
            toast.success("Bank account saved. You can now access all seller tools.");
            // Full reload (not client-side navigate) so SellerLayout remounts
            // and re-fetches seller.isPayoutSetup fresh from the backend —
            // this is what actually unlocks the sidebar and dashboard.
            window.location.href = "/seller/dashboard";
        } catch (err) {
            // interceptor toasts validation errors (e.g. account numbers don't match)
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-gray-500">Loading...</div>;

    return (
        <div className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payout Setup</h1>
            <p className="text-sm text-gray-400 mb-6">
                Add your bank details to receive payments from sales.
            </p>

            {!isEditing && bankAccount && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <p><span className="text-gray-500">Account Holder:</span> {bankAccount.accountHolderName}</p>
                        <p><span className="text-gray-500">Bank:</span> {bankAccount.bankName}</p>
                        <p><span className="text-gray-500">Account Number:</span> {bankAccount.accountNumberMasked}</p>
                        <p><span className="text-gray-500">IFSC:</span> {bankAccount.ifscCode}</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">
                        {bankAccount.isVerified ? "✓ Verified" : "Pending verification (not required to sell in Version 1)"}
                    </p>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                        Update Bank Details
                    </Button>
                </div>
            )}

            {isEditing && (
                <form onSubmit={handleSubmit(onSave)} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <Input label="Account Holder Name" {...register("accountHolderName")} error={errors.accountHolderName?.message} />
                    <Input label="Bank Name" {...register("bankName")} error={errors.bankName?.message} />
                    <Input label="Account Number" type="password" {...register("accountNumber")} error={errors.accountNumber?.message} />
                    <Input label="Confirm Account Number" type="password" {...register("confirmAccountNumber")} error={errors.confirmAccountNumber?.message} />
                    <Input label="IFSC Code" {...register("ifscCode")} error={errors.ifscCode?.message} placeholder="e.g. HDFC0001234" />

                    <div className="flex gap-3">
                        {bankAccount && (
                            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" isLoading={isSaving} className="flex-1">
                            Save Bank Details
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PayoutSetupPage;
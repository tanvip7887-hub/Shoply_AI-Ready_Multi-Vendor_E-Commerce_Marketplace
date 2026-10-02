import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { sellerApplicationApi } from "../api/sellerApplication.api.js";
import { businessInfoSchema, addressStepSchema } from "../features/seller/sellerApplication.schema.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import StepIndicator from "../components/common/StepIndicator.jsx";

const STEPS = ["Business Info", "Pickup Address", "Documents", "Review"];
const DOCUMENT_TYPES = [
    { value: "GST_CERTIFICATE", label: "GST Certificate" },
    { value: "PAN_CARD", label: "PAN Card" },
    { value: "ADDRESS_PROOF", label: "Address Proof" },
    { value: "CANCELLED_CHEQUE", label: "Cancelled Cheque" },
];

const SellerApplicationPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [businessInfo, setBusinessInfo] = useState({});
    const [address, setAddress] = useState({});
    // Queued files, not yet uploaded — { [type]: File }
    const [queuedFiles, setQueuedFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(undefined); // undefined = still loading

    // Checks whether the user already has an application in flight.
    // This is a read-only check on mount — no writes happen here at all.
    useEffect(() => {
        sellerApplicationApi
            .getMine()
            .then((res) => setApplicationStatus(res.data))
            .catch(() => setApplicationStatus(null));
    }, []);

    const businessForm = useForm({ resolver: zodResolver(businessInfoSchema), defaultValues: businessInfo });
    const addressForm = useForm({ resolver: zodResolver(addressStepSchema), defaultValues: { address } });

    // Steps 1 & 2 only validate and store locally — no backend call at all,
    // per requirement 9 (nothing persists until Apply).
    const handleBusinessNext = (data) => {
        setBusinessInfo(data);
        setStep(2);
    };

    const handleAddressNext = (data) => {
        setAddress(data.address);
        setStep(3);
    };

    // Step 3 just queues the File object locally — actual upload is
    // deferred until Apply, since a document can only attach to an
    // application that exists, and no application exists yet.
    const handleQueueDocument = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        setQueuedFiles((prev) => ({ ...prev, [type]: file }));
        toast.success(`${type.replace(/_/g, " ")} selected`);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = { ...businessInfo, address };

            // 1. Create/update the draft — this is the first backend write in
            //    the whole flow, and it's what gives us an applicationId to
            //    attach documents to.
            await sellerApplicationApi.saveDraft(payload);

            // 2. Upload every queued document against that application.
            const uploads = Object.entries(queuedFiles).map(([type, file]) => {
                const form = new FormData();
                form.append("document", file);
                form.append("type", type);
                return sellerApplicationApi.uploadDocument(form);
            });
            await Promise.all(uploads);

            // 3. Finalize — flips status to PENDING.
            await sellerApplicationApi.submit(payload);

            toast.success("Application submitted for review");
            window.location.reload();
        } catch (err) {
            // interceptor already toasts the specific failure
        } finally {
            setIsSubmitting(false);
        }
    };

    if (applicationStatus === undefined) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
    }

    // ---- Status view: an application already exists ----
    if (applicationStatus) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-lg mx-auto px-4 py-20 text-center">
                    {applicationStatus.status === "PENDING" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">⏳</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">Application Under Review</h1>
                            <p className="text-gray-600">
                                Your seller application for <strong>{applicationStatus.businessName}</strong> is being reviewed by our team. We'll notify you once a decision is made.
                            </p>
                        </>
                    )}
                    {applicationStatus.status === "REJECTED" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✕</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">Application Rejected</h1>
                            <p className="text-gray-600 mb-1">Reason: {applicationStatus.rejectionReason}</p>
                            <p className="text-gray-500 text-sm mb-6">You can submit a new application below.</p>
                            <Button onClick={() => { setApplicationStatus(null); setBusinessInfo({}); setAddress({}); setQueuedFiles({}); setStep(1); }}>
                                Start New Application
                            </Button>
                        </>
                    )}
                    {applicationStatus.status === "APPROVED" && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">✓</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 mb-2">You're Approved!</h1>
                            <p className="text-gray-600 mb-6">Log in again to access your Seller Dashboard.</p>
                            <Button onClick={() => navigate("/login")}>Go to Login</Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ---- Wizard: no application yet ----
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <span className="text-2xl font-extrabold text-brand-600">Welcome to Shoply</span>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-2xl font-bold text-center mb-2">Become a Seller</h1>
                <p className="text-center text-gray-500 mb-8">Fill out the details below to start selling on Meesho</p>

                <StepIndicator steps={STEPS} currentStep={step} />

                <div className="bg-white rounded-xl shadow-md p-8">
                    {step === 1 && (
                        <form onSubmit={businessForm.handleSubmit(handleBusinessNext)} className="space-y-4">
                            <Input label="Business Name" {...businessForm.register("businessName")} error={businessForm.formState.errors.businessName?.message} />
                            <Input label="Owner Name" {...businessForm.register("ownerName")} error={businessForm.formState.errors.ownerName?.message} />
                            <Input label="Mobile Number" {...businessForm.register("mobileNumber")} error={businessForm.formState.errors.mobileNumber?.message} />

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Business Type</label>
                                <select
                                    {...businessForm.register("businessType")}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="">Select business type</option>
                                    <option value="INDIVIDUAL">Individual</option>
                                    <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                                    <option value="PARTNERSHIP">Partnership</option>
                                    <option value="PRIVATE_LIMITED">Private Limited</option>
                                    <option value="LLP">LLP</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {businessForm.formState.errors.businessType && (
                                    <p className="text-sm text-red-600">{businessForm.formState.errors.businessType.message}</p>
                                )}
                            </div>

                            <Input label="GST Number (optional)" {...businessForm.register("gstNumber")} />
                            <Input label="PAN Number (optional)" {...businessForm.register("panNumber")} />

                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Business Description</label>
                                <textarea
                                    {...businessForm.register("businessDescription")}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                Continue
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={addressForm.handleSubmit(handleAddressNext)} className="space-y-4">
                            <Input label="Full Name" {...addressForm.register("address.fullName")} error={addressForm.formState.errors.address?.fullName?.message} />
                            <Input label="Phone" {...addressForm.register("address.phone")} error={addressForm.formState.errors.address?.phone?.message} />
                            <Input label="Address Line 1" {...addressForm.register("address.addressLine1")} error={addressForm.formState.errors.address?.addressLine1?.message} />
                            <Input label="Address Line 2 (optional)" {...addressForm.register("address.addressLine2")} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="City" {...addressForm.register("address.city")} error={addressForm.formState.errors.address?.city?.message} />
                                <Input label="State" {...addressForm.register("address.state")} error={addressForm.formState.errors.address?.state?.message} />
                            </div>
                            <Input label="Postal Code" {...addressForm.register("address.postalCode")} error={addressForm.formState.errors.address?.postalCode?.message} />

                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                                    Back
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Continue
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            {DOCUMENT_TYPES.map(({ value, label }) => {
                                const queued = queuedFiles[value];
                                return (
                                    <div key={value} className="flex items-center justify-between border rounded-lg p-4">
                                        <div>
                                            <p className="font-medium text-sm">{label}</p>
                                            {queued && <p className="text-xs text-green-600">{queued.name}</p>}
                                        </div>
                                        <label className="text-sm font-medium text-brand-600 cursor-pointer hover:underline">
                                            {queued ? "Replace" : "Select file"}
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                onChange={(e) => handleQueueDocument(e, value)}
                                            />
                                        </label>
                                    </div>
                                );
                            })}

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                                    Back
                                </Button>
                                <Button type="button" onClick={() => setStep(4)} className="flex-1">
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Business Name:</span> <span className="font-medium">{businessInfo.businessName}</span></p>
                                <p><span className="text-gray-500">Owner Name:</span> <span className="font-medium">{businessInfo.ownerName}</span></p>
                                <p><span className="text-gray-500">Mobile:</span> <span className="font-medium">{businessInfo.mobileNumber}</span></p>
                                <p><span className="text-gray-500">Business Type:</span> <span className="font-medium">{businessInfo.businessType}</span></p>
                                <p><span className="text-gray-500">Pickup City:</span> <span className="font-medium">{address.city}, {address.state}</span></p>
                                <p><span className="text-gray-500">Documents Selected:</span> <span className="font-medium">{Object.keys(queuedFiles).length} of {DOCUMENT_TYPES.length}</span></p>
                            </div>

                            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                Nothing has been submitted yet. Clicking Apply will save your application and send it for admin review — after that, you won't be able to edit it until a decision is made.
                            </p>

                            <div className="flex gap-3">
                                <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1">
                                    Back
                                </Button>
                                <Button type="button" onClick={handleFinalSubmit} isLoading={isSubmitting} className="flex-1">
                                    Apply
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerApplicationPage;
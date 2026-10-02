import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api.js";
import Button from "../../components/ui/Button.jsx";

const SellerApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    adminApi
      .getApplicationById(id)
      .then((res) => setApplication(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminApi.approveApplication(id);
      toast.success("Application approved — seller activated");
      navigate("/admin/seller-applications");
    } catch (err) {
      // interceptor toasts
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.rejectApplication(id, rejectReason);
      toast.success("Application rejected");
      navigate("/admin/seller-applications");
    } catch (err) {
      // interceptor toasts
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!application) return <div className="text-gray-500">Application not found.</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{application.businessName}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold mb-3">Business Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="text-gray-500">Owner:</span> {application.ownerName}</p>
          <p><span className="text-gray-500">Mobile:</span> {application.mobileNumber}</p>
          <p><span className="text-gray-500">Business Type:</span> {application.businessType}</p>
          <p><span className="text-gray-500">GST:</span> {application.gstNumber || "—"}</p>
          <p><span className="text-gray-500">PAN:</span> {application.panNumber || "—"}</p>
          <p><span className="text-gray-500">Applicant:</span> {application.user?.name} ({application.user?.email})</p>
        </div>
        {application.businessDescription && (
          <p className="text-sm text-gray-600 mt-3">{application.businessDescription}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold mb-3">Pickup Address</h2>
        <p className="text-sm text-gray-600">
          {application.sellerAddress?.fullName}, {application.sellerAddress?.phone}<br />
          {application.sellerAddress?.addressLine1}
          {application.sellerAddress?.addressLine2 && `, ${application.sellerAddress.addressLine2}`}<br />
          {application.sellerAddress?.city}, {application.sellerAddress?.state} - {application.sellerAddress?.postalCode}
        </p>
      </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold mb-3">Uploaded Documents</h2>

        {application.documents?.length === 0 ? (
          <p className="text-sm text-gray-400">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {application.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-brand-600 hover:underline"
              >
                {doc.type.replace(/_/g, " ")}
              </a>
            ))}
          </div>
        )}
      </div>

      {application.status === "REJECTED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
          <strong>Rejection Reason:</strong> {application.rejectionReason}
        </div>
      )}

      {application.status === "PENDING" && (
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            isLoading={actionLoading}
            className="flex-1"
          >
            Approve
          </Button>

          <Button
            variant="danger"
            onClick={() => setShowRejectModal(true)}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-3">Reject Application</h3>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={actionLoading}
                className="flex-1"
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerApplicationDetailPage;

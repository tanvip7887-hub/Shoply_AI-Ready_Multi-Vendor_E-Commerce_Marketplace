import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api.js";
import Button from "../../components/ui/Button.jsx";

const SellerDetailPage = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    adminApi.getSellerById(id).then((res) => setSeller(res.data)).catch(() => {}).finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const handleSuspend = async () => {
    setActionLoading(true);
    try {
      await adminApi.suspendSeller(id);
      toast.success("Seller suspended");
      load();
    } catch (err) {
      // interceptor toasts
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    try {
      await adminApi.unsuspendSeller(id);
      toast.success("Seller reactivated");
      load();
    } catch (err) {
      // interceptor toasts
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!seller) return <div className="text-gray-500">Seller not found.</div>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/sellers" className="text-sm text-gray-400 hover:text-brand-600 mb-4 inline-block">
        ← Back to Sellers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{seller.businessName}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold mb-3">Business Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="text-gray-500">Owner:</span> {seller.ownerName}</p>
          <p><span className="text-gray-500">Mobile:</span> {seller.mobileNumber}</p>
          <p><span className="text-gray-500">GST:</span> {seller.gstNumber || "—"}</p>
          <p><span className="text-gray-500">PAN:</span> {seller.panNumber || "—"}</p>
          <p><span className="text-gray-500">Account:</span> {seller.user?.name} ({seller.user?.email})</p>
          <p><span className="text-gray-500">Seller Code:</span> {seller.sellerCode}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold mb-3">Pickup Address</h2>
        <p className="text-sm text-gray-600">
          {seller.sellerAddress?.addressLine1}, {seller.sellerAddress?.city}, {seller.sellerAddress?.state} - {seller.sellerAddress?.postalCode}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold mb-3">Payout & Bank Details</h2>
        {seller.isPayoutSetup && seller.bankAccount ? (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Account Holder: {seller.bankAccount.accountHolderName}</p>
            <p>Account Number: •••• {seller.bankAccount.accountLastFour}</p>
            <p>Bank: {seller.bankAccount.bankName} ({seller.bankAccount.ifscCode})</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Payout setup not completed yet.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Link to={`/admin/products?sellerId=${seller.id}`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-base">
          <p className="text-2xl font-bold text-gray-900">{seller._count?.products ?? 0}</p>
          <p className="text-xs text-gray-500">Products</p>
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{seller._count?.orders ?? 0}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
      </div>

      {seller.status === "VERIFIED" ? (
        <Button variant="danger" onClick={handleSuspend} isLoading={actionLoading}>
          Suspend Seller
        </Button>
      ) : (
        <Button onClick={handleUnsuspend} isLoading={actionLoading}>
          Unsuspend Seller
        </Button>
      )}
    </div>
  );
};

export default SellerDetailPage;
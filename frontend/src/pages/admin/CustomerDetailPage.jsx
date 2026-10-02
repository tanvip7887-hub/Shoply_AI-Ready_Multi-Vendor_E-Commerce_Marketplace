import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api.js";
import Button from "../../components/ui/Button.jsx";

const CustomerDetailPage = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    adminApi.getCustomerById(id).then((res) => setCustomer(res.data)).catch(() => {}).finally(() => setIsLoading(false));
  };

  useEffect(load, [id]);

  const toggleBlock = async () => {
    setActionLoading(true);
    try {
      const newStatus = customer.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
      await adminApi.updateUserStatus(id, newStatus);
      toast.success(newStatus === "BLOCKED" ? "Customer blocked" : "Customer unblocked");
      load();
    } catch (err) {
      // interceptor toasts (e.g. "cannot block your own account")
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="text-gray-500">Loading...</div>;
  if (!customer) return <div className="text-gray-500">Customer not found.</div>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/customers" className="text-sm text-gray-400 hover:text-brand-600 mb-4 inline-block">
        ← Back to Customers
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{customer.name}</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold mb-3">Account Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="text-gray-500">Email:</span> {customer.email}</p>
          <p><span className="text-gray-500">Phone:</span> {customer.phone || "—"}</p>
          <p><span className="text-gray-500">Registered:</span> {new Date(customer.createdAt).toLocaleDateString()}</p>
          <p><span className="text-gray-500">Status:</span> {customer.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="font-semibold mb-3">Addresses</h2>
        {customer.addresses.length === 0 && <p className="text-sm text-gray-400">No addresses saved.</p>}
        {customer.addresses.map((addr) => (
          <p key={addr.id} className="text-sm text-gray-600 mb-2">
            {addr.fullName} — {addr.addressLine1}, {addr.city}, {addr.state} {addr.isDefault && "(Default)"}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{customer.orderCount}</p>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{customer.wishlistCount}</p>
          <p className="text-xs text-gray-500">Wishlist Items</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{customer.cartItemCount}</p>
          <p className="text-xs text-gray-500">Items in Cart</p>
        </div>
      </div>

      <Button variant={customer.status === "ACTIVE" ? "danger" : "primary"} onClick={toggleBlock} isLoading={actionLoading}>
        {customer.status === "ACTIVE" ? "Block Customer" : "Unblock Customer"}
      </Button>
    </div>
  );
};

export default CustomerDetailPage;
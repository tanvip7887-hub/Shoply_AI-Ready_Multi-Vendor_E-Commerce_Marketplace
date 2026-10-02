import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Repeat,
  Search,
  X,
  ShoppingBag,
  Calendar,
  IndianRupee,
  Mail,
  Phone,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  PackageCheck,
} from "lucide-react";
import { sellerCustomerApi } from "../../api/sellerCustomer.api.js";
import toast from "react-hot-toast";

const getStatusBadge = (status) => {
  switch (status) {
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle size={12} /> Delivered
        </span>
      );
    case "SHIPPED":
    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Truck size={12} /> {status.replace(/_/g, " ")}
        </span>
      );
    case "READY_TO_SHIP":
    case "PROCESSING":
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <PackageCheck size={12} /> {status.replace(/_/g, " ")}
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} /> Pending
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle size={12} /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          {status}
        </span>
      );
  }
};

const SellerCustomersPage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalCustomers: 0, newCustomers: 0, repeatCustomers: 0 });
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  // Drawer / Detail modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchCustomers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await sellerCustomerApi.getCustomers({ search: searchQuery });
      if (res.data) {
        setSummary(res.data.summary || { totalCustomers: 0, newCustomers: 0, repeatCustomers: 0 });
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load seller customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  const handleOpenDetails = async (customerId) => {
    try {
      setDetailLoading(true);
      setIsDrawerOpen(true);
      const res = await sellerCustomerApi.getCustomerDetails(customerId);
      if (res.data) {
        setSelectedCustomer(res.data.customer);
        setCustomerOrders(res.data.orders || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load customer details");
      setIsDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and view customers who have purchased products from your store.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {loading ? "..." : summary.totalCustomers}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Unique buyers with your store</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">New Customers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {loading ? "..." : summary.newCustomers}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Customers with 1 order</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Repeat Customers</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {loading ? "..." : summary.repeatCustomers}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Customers with &gt; 1 order</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Repeat size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-700">{customers.length}</span> customer(s)
          </div>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-2"></div>
            <p className="text-sm font-medium">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Customers Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              {search
                ? `No seller customers matched your search query "${search}".`
                : "No customers have purchased products from your store yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5 text-center">Orders</th>
                  <th className="px-6 py-3.5 text-right">Total Amount Spent</th>
                  <th className="px-6 py-3.5">Last Order Date</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                      {c.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ₹{c.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(c.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.status === "Repeat"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(c.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                      >
                        View Details <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Slide-over / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
                <p className="text-xs text-gray-500">Order activity with your store</p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent mb-2"></div>
                  <p className="text-sm font-medium">Fetching details...</p>
                </div>
              ) : selectedCustomer ? (
                <>
                  {/* Customer Card */}
                  <div className="bg-gradient-to-r from-brand-50 to-indigo-50 p-5 rounded-xl border border-brand-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedCustomer.status === "Repeat"
                            ? "bg-purple-600 text-white"
                            : "bg-brand-600 text-white"
                        }`}
                      >
                        {selectedCustomer.status} Customer
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 pt-2 border-t border-brand-100/60">
                      <div className="flex items-center gap-2">
                        <Mail size={15} className="text-brand-600 shrink-0" />
                        <span className="truncate">{selectedCustomer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={15} className="text-brand-600 shrink-0" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Summary Box */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center">
                      <ShoppingBag size={18} className="mx-auto text-gray-500 mb-1" />
                      <div className="text-xs text-gray-500">Total Orders</div>
                      <div className="text-base font-bold text-gray-900 mt-0.5">
                        {selectedCustomer.totalOrders}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center">
                      <IndianRupee size={18} className="mx-auto text-emerald-600 mb-1" />
                      <div className="text-xs text-gray-500">Total Spent</div>
                      <div className="text-base font-bold text-gray-900 mt-0.5">
                        ₹{selectedCustomer.totalSpent.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center">
                      <Calendar size={18} className="mx-auto text-blue-600 mb-1" />
                      <div className="text-xs text-gray-500">Last Order</div>
                      <div className="text-xs font-bold text-gray-900 mt-1">
                        {new Date(selectedCustomer.lastOrderDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-brand-600" />
                      Order History with Your Store ({customerOrders.length})
                    </h4>

                    {customerOrders.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No order history found.</p>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs text-gray-600">
                          <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-500 uppercase">
                            <tr>
                              <th className="px-4 py-3">Order ID</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3 text-center">Items</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {customerOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  {ord.orderNumber}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                  {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td className="px-4 py-3 text-center font-medium">
                                  {ord.itemCount}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                  ₹{ord.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getStatusBadge(ord.orderStatus)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseDrawer}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerCustomersPage;

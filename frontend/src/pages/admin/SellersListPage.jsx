import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/admin.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";

const STATUS_FILTERS = ["ALL", "VERIFIED", "SUSPENDED"];
const statusColor = { VERIFIED: "bg-green-100 text-green-700", SUSPENDED: "bg-red-100 text-red-700" };

const SellersListPage = () => {
  const [sellers, setSellers] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = {};
    if (filter !== "ALL") params.status = filter;
    if (search) params.search = search;
    const timeout = setTimeout(() => {
      adminApi.getSellers(params).then((res) => setSellers(res.data)).catch(() => {}).finally(() => setIsLoading(false));
    }, 300); // light debounce so typing doesn't fire a request per keystroke
    return () => clearTimeout(timeout);
  }, [filter, search]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Sellers</h1>
      <p className="text-sm text-gray-400 mb-6">Manage approved sellers on the marketplace</p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-base ${
                filter === f ? "bg-brand-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search business name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payout Setup</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t"><td colSpan={7} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
              ))}
            {!isLoading && sellers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No sellers found</td></tr>
            )}
            {!isLoading &&
              sellers.map((seller) => (
                <tr key={seller.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{seller.businessName}</td>
                  <td className="px-4 py-3">{seller.ownerName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[seller.status]}`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {seller.isPayoutSetup ? (
                      <span className="text-green-600 text-xs font-medium">Complete</span>
                    ) : (
                      <span className="text-gray-400 text-xs font-medium">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{seller._count?.products ?? 0}</td>
                  <td className="px-4 py-3">{seller._count?.orders ?? 0}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/sellers/${seller.id}`} className="text-brand-600 font-medium hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellersListPage;
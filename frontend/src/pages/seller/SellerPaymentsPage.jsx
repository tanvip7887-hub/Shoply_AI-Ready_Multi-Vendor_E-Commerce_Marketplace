import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  X,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { sellerPayoutApi } from "../../api/sellerPayout.api.js";
import Skeleton from "../../components/ui/Skeleton.jsx";
import Button from "../../components/ui/Button.jsx";

const STATUS_FILTERS = ["ALL", "PENDING", "PAID", "REFUNDED"];

const statusBadge = {
  Paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Refunded: "bg-rose-100 text-rose-800 border-rose-200",
};

const formatINR = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val || 0);
};

const SellerPaymentsPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    fetchPaymentsData();
  }, [filter]);

  const fetchPaymentsData = async () => {
    setIsLoading(true);
    try {
      const res = await sellerPayoutApi.getPayments({ status: filter });
      const payload = res.data?.data || res.data || res;
      setData(payload);
    } catch (err) {
      toast.error(err?.message || "Failed to load payment data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const summary = data?.summary || {
    totalEarnings: 0,
    pendingSettlement: 0,
    paidSettlements: 0,
    refundsAdjustments: 0,
  };

  const nextSettlement = data?.nextSettlement || {
    amount: 0,
    status: "No pending settlements",
    payoutAccount: { configured: false, maskedText: "Payout account not set up" },
  };

  const transactions = data?.transactions || [];
  const settlements = data?.settlements || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="text-brand-600" />
          Payments
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your earnings, pending settlements and payment history.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatINR(summary.totalEarnings)}</p>
          <span className="text-xs text-gray-400 mt-1">Gross revenue from completed sales</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Settlement</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{formatINR(summary.pendingSettlement)}</p>
          <span className="text-xs text-gray-400 mt-1">Awaiting next payout cycle</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid Settlements</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">{formatINR(summary.paidSettlements)}</p>
          <span className="text-xs text-gray-400 mt-1">Disbursed to your account</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Refunds / Adjustments</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={18} />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{formatINR(summary.refundsAdjustments)}</p>
          <span className="text-xs text-gray-400 mt-1">Cancelled & refunded orders</span>
        </div>
      </div>

      {/* Current / Next Settlement & Payout Account Section */}
      <div className="bg-gradient-to-r from-brand-900 via-[#570D48] to-brand-700 rounded-2xl p-6 text-white shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-200 block mb-1">
            Next Settlement
          </span>
          <h2 className="text-3xl font-extrabold mb-1">{formatINR(nextSettlement.amount)}</h2>
          <p className="text-xs text-brand-100 flex items-center gap-1.5 mt-2">
            <Clock size={14} />
            {nextSettlement.status}
          </p>
          <p className="text-[11px] text-brand-200/80 mt-1">
            Based on eligible delivered & confirmed orders.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-brand-200 block">Payout Account</span>
              <p className="text-base font-bold text-white flex items-center gap-2 mt-1">
                <Building2 size={18} className="text-brand-300 shrink-0" />
                {nextSettlement.payoutAccount?.maskedText || "Payout account not set up"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
            <Link
              to="/seller/payout"
              className="px-3.5 py-1.5 rounded-lg bg-white text-[#570D48] hover:bg-brand-50 text-xs font-bold transition-base flex items-center gap-1"
            >
              {nextSettlement.payoutAccount?.configured ? "Manage Payout Setup" : "Complete Payout Setup"}
            </Link>
          </div>
        </div>
      </div>

      {/* Payment Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment Transactions</h2>
            <p className="text-xs text-gray-500">
              Orders and individual transaction payouts for your products.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-base ${
                  filter === f
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Order Amount</th>
                <th className="px-5 py-3.5">Refund / Adj.</th>
                <th className="px-5 py-3.5">Net Amount</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    <p className="font-semibold text-gray-600">No payment transactions yet.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Transactions will appear here automatically when orders are placed.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-gray-50/80 cursor-pointer transition-base"
                  >
                    <td className="px-5 py-3.5 font-bold text-brand-600 hover:underline">
                      {tx.orderRef}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">
                      {formatINR(tx.orderAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-rose-600 font-medium">
                      {tx.refund > 0 ? `-${formatINR(tx.refund)}` : "₹0.00"}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-gray-900">
                      {formatINR(tx.netAmount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                          statusBadge[tx.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Settlement History</h2>
          <p className="text-xs text-gray-500">
            Batched bank payouts disbursed to your registered account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5">Settlement ID</th>
                <th className="px-5 py-3.5">Settlement Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Orders</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No settlements processed yet.
                  </td>
                </tr>
              ) : (
                settlements.map((st) => (
                  <tr key={st.settlementId} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-bold text-gray-900 font-mono">
                      {st.settlementId}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                      {new Date(st.settlementDate).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-gray-900">
                      {formatINR(st.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {st.ordersCount} {st.ordersCount === 1 ? "order" : "orders"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                          st.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 relative animate-in fade-in">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <ShoppingBag className="text-brand-600" size={22} />
              Payment Details
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Transaction details for order <strong className="text-gray-900">{selectedTx.orderRef}</strong>
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm border border-gray-200 mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Order Amount</span>
                <span className="font-semibold text-gray-900">{formatINR(selectedTx.orderAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Refund</span>
                <span>-{formatINR(selectedTx.refund)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Adjustment</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-extrabold text-base text-gray-900">
                <span>Net Seller Amount</span>
                <span className="text-brand-700">{formatINR(selectedTx.netAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block mb-0.5">Payment Status</span>
                <span className="font-bold text-gray-900">{selectedTx.paymentStatus}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-500 block mb-0.5">Order Status</span>
                <span className="font-bold text-gray-900">{selectedTx.orderStatus}</span>
              </div>
            </div>

            {selectedTx.items?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Items in Order
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedTx.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between text-xs py-1.5 px-2.5 bg-gray-50 rounded border border-gray-100"
                    >
                      <span className="font-medium text-gray-800 line-clamp-1">{it.productName}</span>
                      <span className="text-gray-600 shrink-0 ml-2">
                        {it.quantity} x ₹{it.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setSelectedTx(null)} className="!py-2 !px-5 text-xs font-bold">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerPaymentsPage;

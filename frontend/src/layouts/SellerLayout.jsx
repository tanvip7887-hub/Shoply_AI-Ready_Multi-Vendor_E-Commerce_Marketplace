import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, Package, Boxes, ShoppingBag, RotateCcw, Users,
  Wallet, Star, Ticket, User, LogOut, Lock,
} from "lucide-react";
import { logout } from "../store/slices/authSlice.js";
import { sellerPayoutApi } from "../api/sellerPayout.api.js";
import NotificationBell from "../components/common/NotificationBell.jsx";
import toast from "react-hot-toast";

const navItems = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/payout", label: "Payout Setup", icon: Wallet },
  { to: "/seller/products", label: "Products", icon: Package },
  { to: "/seller/inventory", label: "Inventory", icon: Boxes },
  { to: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { to: "/seller/payments", label: "Payments", icon: Wallet },
  { to: "/seller/customers", label: "Customers", icon: Users },
  { to: "/seller/returns", label: "Returns", icon: RotateCcw },
  { to: "/seller/coupons", label: "Coupons", icon: Ticket },
  { to: "/seller/reviews", label: "Reviews", icon: Star },
  { to: "/seller/profile", label: "Profile", icon: User },
];

const ALWAYS_UNLOCKED = ["/seller/dashboard", "/seller/profile", "/seller/payout"];

const SellerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isPayoutSetup, setIsPayoutSetup] = useState(null); // null = loading

  useEffect(() => {
    sellerPayoutApi
      .getMine()
      .then((res) => setIsPayoutSetup(!!res.data))
      .catch(() => setIsPayoutSetup(false));
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  const isLocked = isPayoutSetup === false;

  return (
    <div className="h-screen flex bg-[#F8FAFC] overflow-hidden">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="text-xl font-extrabold text-brand-600">Shoply</span>
          <span className="block text-xs text-gray-400 font-medium mt-0.5">Seller Panel</span>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            const locked = isLocked && !ALWAYS_UNLOCKED.includes(to);

            return locked ? (
              <div
                key={to}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 cursor-not-allowed"
                title="Complete payout setup to unlock"
              >
                <Icon size={17} />
                {label}
                <Lock size={13} className="ml-auto" />
              </div>
            ) : (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-base ${isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-base"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-6">
          <div className="text-sm font-semibold text-gray-700">
            Welcome, <span className="text-brand-600 font-bold">{user?.ownerName || user?.businessName || user?.name || "Seller"}</span>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </div>
        {isLocked && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800 text-sm">
                Complete your payout setup before you can start selling.
              </p>
              <p className="text-yellow-700 text-xs mt-0.5">
                Products, Orders, Inventory and other seller tools are locked until this is done.
              </p>
            </div>
            <Link
              to="/seller/payout"
              className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-semibold shrink-0 hover:bg-yellow-700 transition-base"
            >
              Complete Now
            </Link>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
};

export default SellerLayout;
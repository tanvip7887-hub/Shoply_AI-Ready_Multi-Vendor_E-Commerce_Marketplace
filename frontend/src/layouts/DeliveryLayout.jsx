import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Package, Truck, LogOut, User } from "lucide-react";
import { logout } from "../store/slices/authSlice.js";
import toast from "react-hot-toast";

const navItems = [
  { to: "/delivery/available", label: "Available Pickups", icon: Package },
  { to: "/delivery/mine", label: "My Shipments", icon: Truck },
  { to: "/delivery/profile", label: "Agent Profile", icon: User },
];

const DeliveryLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen flex bg-[#F8FAFC] overflow-hidden">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
        <div className="px-5 py-5 border-b border-gray-200">
          <span className="text-xl font-extrabold text-brand-600">Shoply</span>
          <span className="block text-xs text-gray-400 font-medium mt-0.5">Delivery Agent Portal</span>
        </div>

        {user && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
              <User size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-base ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
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
        <Outlet />
      </main>
    </div>
  );
};

export default DeliveryLayout;

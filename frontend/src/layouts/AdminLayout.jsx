import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, FileText, Store, Users, Package, FolderTree, Tag,
  ShoppingBag, BarChart3, Settings, LogOut, Bell, Menu, X, Truck,
} from "lucide-react";
import { logout } from "../store/slices/authSlice.js";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/seller-applications", label: "Seller Applications", icon: FileText },
  { to: "/admin/delivery-applications", label: "Delivery Applications", icon: Truck },
  { to: "/admin/sellers", label: "Sellers", icon: Store },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/brands", label: "Brands", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  const currentLabel = navItems.find((n) => location.pathname.startsWith(n.to))?.label || "Dashboard";

  const Sidebar = (
    <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 h-full">
      <div className="px-6 py-5 border-b border-gray-200">
        <span className="text-xl font-extrabold text-brand-600">Shoply</span>
        <span className="block text-xs text-gray-400 font-medium mt-0.5">Admin Portal</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base ${isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                }`}
            >
              <Icon size={18} />
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
  );

  return (
    <div className="h-screen flex bg-[#F8FAFC] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500">
              <Menu size={22} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Manage your marketplace efficiently</p>
            </div>
          </div>

        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
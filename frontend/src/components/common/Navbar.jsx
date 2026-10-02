import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, ShoppingCart, Heart, Package, User, LogOut, MapPin, Bell } from "lucide-react";
import { logout } from "../../store/slices/authSlice.js";
import axiosClient from "../../api/axiosClient.js";
import toast from "react-hot-toast";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [deliveryAppStatus, setDeliveryAppStatus] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const { count: wishlistCount } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated && user?.role === "CUSTOMER") {
      axiosClient
        .get("/delivery-applications/mine")
        .then((res) => {
          const app = res?.data?.data || res?.data || (res?.id ? res : null);
          setDeliveryAppStatus(app?.status || null);
        })
        .catch(() => setDeliveryAppStatus(null));
    } else {
      setDeliveryAppStatus(null);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (e) {}
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  // Determine Delivery Navbar Link text & destination
  let deliveryLinkText = "Become a Delivery Partner";
  let deliveryLinkTo = "/become-delivery-partner";

  if (user?.role === "DELIVERY_AGENT" || deliveryAppStatus === "APPROVED") {
    deliveryLinkText = "Start Delivering";
    deliveryLinkTo = "/delivery/available";
  } else if (deliveryAppStatus === "PENDING") {
    deliveryLinkText = "Delivery Partner - Under Review";
    deliveryLinkTo = "/become-delivery-partner";
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-2.5 flex items-center gap-8">
        <Link
          to="/"
          className="shrink-0"
          style={{
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 700,
            fontSize: '30px',
            letterSpacing: '-1px',
            color: '#570D48',
          }}
        >
          shoply
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-[520px]">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 gap-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Saree, Kurti or Search by Product Code"
              className="flex-1 border-none outline-none bg-transparent text-gray-700 placeholder-gray-400"
              style={{ fontSize: '16px', fontWeight: 400 }}
            />
          </div>
        </form>

        <nav className="flex items-center gap-4 text-[15px] font-medium text-gray-900 shrink-0 ml-auto">
          <Link to="/sell-on-meesho" className="hover:text-brand-600 transition-colors">Become a Supplier</Link>
          <span className="w-px h-6 bg-gray-300"></span>
          <Link to={deliveryLinkTo} className="hover:text-brand-600 transition-colors">{deliveryLinkText}</Link>
          <span className="w-px h-6 bg-gray-300"></span>
          <div className="flex items-center gap-7 ml-3 h-full relative">
            <div className="relative group flex items-center h-full py-2.5">
              <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-800 group-hover:text-brand-600 transition-base">
                <User size={24} strokeWidth={1.5} />
                <span className="text-[12px] font-medium">Profile</span>
              </Link>

              {/* Dropdown Menu */}
              <div className="absolute top-[100%] right-[-50px] w-[260px] bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-[100] cursor-default">
                {/* invisible safe bridge area to avoid hover loss */}
                <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"></div>
                {isAuthenticated && user ? (
                  <div className="flex flex-col text-sm text-gray-800">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#eef6ff] text-[#4f73f5] rounded-full flex items-center justify-center font-bold text-xl shrink-0">
                        <User size={24} fill="currentColor" stroke="none" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-[17px] text-gray-800 truncate">Hello User</span>
                        <span className="text-gray-600 text-[14px] truncate">{user.phone || user.email || "+91 9588417698"}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <Link to="/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700">
                      <Package size={20} strokeWidth={1.5} />
                      My Orders
                    </Link>
                    <Link to="/notifications" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700">
                      <Bell size={20} strokeWidth={1.5} />
                      Notifications
                    </Link>
                    <Link to="/addresses" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700">
                      <MapPin size={20} strokeWidth={1.5} />
                      My Addresses
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700 w-full text-left">
                      Delete Account
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700 w-full text-left">
                      <LogOut size={20} strokeWidth={1.5} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col text-sm text-gray-800">
                    <div className="p-5 flex flex-col gap-1">
                      <span className="font-semibold text-[18px] text-gray-800">Hello User</span>
                      <span className="text-[13px] text-gray-500 mb-3">To access your Meesho account</span>
                      <Link to="/login" className="bg-[#570D48] hover:bg-[#4a0b3d] text-white font-medium py-2.5 rounded flex items-center justify-center text-[16px] transition-colors w-full">
                        Sign Up
                      </Link>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <Link to="/orders" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700">
                      <Package size={20} strokeWidth={1.5} />
                      My Orders
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <Link to="/addresses" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700">
                      <MapPin size={20} strokeWidth={1.5} />
                      My Addresses
                    </Link>
                    <div className="border-t border-gray-200"></div>
                    <button className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 font-medium text-[16px] text-gray-700 w-full text-left">
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            <NotificationBell />

            <Link to="/wishlist" className="flex flex-col items-center gap-1 text-gray-800 hover:text-brand-600 transition-base relative">
              <div className="relative">
                <Heart size={24} strokeWidth={1.5} />
                {isAuthenticated && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#f43397] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium">Wishlist</span>
            </Link>

            <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-800 hover:text-brand-600 transition-base relative">
              <div className="relative">
                <ShoppingCart size={24} strokeWidth={1.5} />
                {isAuthenticated && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#f43397] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[12px] font-medium">Cart</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
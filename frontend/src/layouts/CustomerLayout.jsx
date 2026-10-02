import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import CategoryNav from "../components/common/CategoryNav.jsx";
import Footer from "../components/common/Footer.jsx";
import UnverifiedBanner from "../components/common/UnverifiedBanner.jsx";

const CustomerLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const hideCategoryNav = [
    '/cart', '/checkout', '/payment', '/order-confirmation', 
    '/profile', '/addresses', '/wishlist'
  ].includes(location.pathname) || 
  location.pathname.startsWith('/orders') ||
  /^\/products\/.+/.test(location.pathname);

  const showFooter = location.pathname === '/';
  const showCategoryNav = !isAuthPage && !hideCategoryNav;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <UnverifiedBanner />
        <Navbar />
        {showCategoryNav && <CategoryNav />}
      </div>

      <main className={`flex-1 ${showCategoryNav ? 'pt-[108px]' : 'pt-[61px]'}`}>
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default CustomerLayout;
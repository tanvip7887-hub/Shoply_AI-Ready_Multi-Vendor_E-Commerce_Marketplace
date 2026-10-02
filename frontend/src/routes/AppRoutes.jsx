import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import CustomerLayout from "../layouts/CustomerLayout.jsx";
import SellerLayout from "../layouts/SellerLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import ProductListingPage from "../pages/ProductListingPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import AddressPage from "../pages/AddressPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import PaymentPage from "../pages/PaymentPage.jsx";
import OrderConfirmationPage from "../pages/OrderConfirmationPage.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import WishlistPage from "../pages/WishlistPage.jsx";
import OrderDetailPage from "../pages/OrderDetailPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import BecomeSellerPage from "../pages/BecomeSellerPage.jsx";
import BecomeDeliveryPartnerPage from "../pages/BecomeDeliveryPartnerPage.jsx";
import DeliveryApplicationPage from "../pages/DeliveryApplicationPage.jsx";
import SellerApplicationPage from "../pages/SellerApplicationPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import SellerApplicationsListPage from "../pages/admin/SellerApplicationsListPage.jsx";
import DeliveryApplicationsListPage from "../pages/admin/DeliveryApplicationsListPage.jsx";
import SellerApplicationDetailPage from "../pages/admin/SellerApplicationDetailPage.jsx";
import SellersListPage from "../pages/admin/SellersListPage.jsx";
import SellerDetailPage from "../pages/admin/SellerDetailPage.jsx";
import CustomersListPage from "../pages/admin/CustomersListPage.jsx";
import CustomerDetailPage from "../pages/admin/CustomerDetailPage.jsx";
import ProductsListPage from "../pages/admin/ProductsListPage.jsx";
import CategoriesPage from "../pages/admin/CategoriesPage.jsx";
import BrandsPage from "../pages/admin/BrandsPage.jsx";
import OrdersListPage from "../pages/admin/OrdersListPage.jsx";
import AdminOrderDetailPage from "../pages/admin/OrderDetailPage.jsx";
import AnalyticsPage from "../pages/admin/AnalyticsPage.jsx";
import VerifyEmailPage from "../pages/VerifyEmailPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import SellerDashboardPage from "../pages/seller/SellerDashboardPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import PayoutSetupPage from "../pages/seller/PayoutSetupPage.jsx";
import SellerProfilePage from "../pages/seller/SellerProfilePage.jsx";
import SellerProductsListPage from "../pages/seller/SellerProductsListPage.jsx";
import SellerProductFormPage from "../pages/seller/SellerProductFormPage.jsx";
import SellerProductDetailPage from "../pages/seller/SellerProductDetailPage.jsx";
import SellerInventoryListPage from "../pages/seller/SellerInventoryListPage.jsx";
import SellerInventoryHistoryPage from "../pages/seller/SellerInventoryHistoryPage.jsx";
import SellerOrdersListPage from "../pages/seller/SellerOrdersListPage.jsx";
import SellerPaymentsPage from "../pages/seller/SellerPaymentsPage.jsx";
import SellerCustomersPage from "../pages/seller/SellerCustomersPage.jsx";
import SellerReviewsPage from "../pages/seller/SellerReviewsPage.jsx";
import SellerReturnsListPage from "../pages/seller/SellerReturnsListPage.jsx";
import MyReturnsPage from "../pages/MyReturnsPage.jsx";
import DeliveryLayout from "../layouts/DeliveryLayout.jsx";
import DeliveryAvailablePickupsPage from "../pages/delivery/DeliveryAvailablePickupsPage.jsx";
import DeliveryMyShipmentsPage from "../pages/delivery/DeliveryMyShipmentsPage.jsx";
import DeliveryProfilePage from "../pages/delivery/DeliveryProfilePage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public, no navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sell-on-meesho" element={<BecomeSellerPage />} />
      <Route path="/become-delivery-partner" element={<BecomeDeliveryPartnerPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Public, with customer navbar/footer */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
      </Route>

      {/* Any authenticated user, no specific role, standalone (no layout) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/seller/apply" element={<SellerApplicationPage />} />
        <Route path="/delivery/apply" element={<BecomeDeliveryPartnerPage />} />
      </Route>

      {/* Customer-protected */}
      <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
        <Route element={<CustomerLayout />}>
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/returns/my" element={<MyReturnsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/addresses" element={<AddressPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Seller-protected */}
      <Route element={<ProtectedRoute allowedRoles={["SELLER"]} />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/seller/payout" element={<PayoutSetupPage />} />
          <Route path="/seller/profile" element={<SellerProfilePage />} />
          <Route path="/seller/products" element={<SellerProductsListPage />} />
          <Route path="/seller/products/new" element={<SellerProductFormPage />} />
          <Route path="/seller/products/:id/edit" element={<SellerProductFormPage />} />
          <Route path="/seller/products/:id" element={<SellerProductDetailPage />} />
          <Route path="/seller/inventory" element={<SellerInventoryListPage />} />
          <Route path="/seller/inventory/:productId" element={<SellerInventoryHistoryPage />} />
          <Route path="/seller/orders" element={<SellerOrdersListPage />} />
          <Route path="/seller/returns" element={<SellerReturnsListPage />} />
          <Route path="/seller/payments" element={<SellerPaymentsPage />} />
          <Route path="/seller/customers" element={<SellerCustomersPage />} />
          <Route path="/seller/reviews" element={<SellerReviewsPage />} />
          <Route path="/seller/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Admin-protected */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/seller-applications" element={<SellerApplicationsListPage />} />
          <Route path="/admin/delivery-applications" element={<DeliveryApplicationsListPage />} />
          <Route path="/admin/seller-applications/:id" element={<SellerApplicationDetailPage />} />
          <Route path="/admin/sellers" element={<SellersListPage />} />
          <Route path="/admin/sellers/:id" element={<SellerDetailPage />} />
          <Route path="/admin/customers" element={<CustomersListPage />} />
          <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/admin/products" element={<ProductsListPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/brands" element={<BrandsPage />} />
          <Route path="/admin/orders" element={<OrdersListPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* Delivery Agent-protected */}
      <Route element={<ProtectedRoute allowedRoles={["DELIVERY_AGENT"]} />}>
        <Route element={<DeliveryLayout />}>
          <Route path="/delivery" element={<Navigate to="/delivery/available" replace />} />
          <Route path="/delivery/available" element={<DeliveryAvailablePickupsPage />} />
          <Route path="/delivery/mine" element={<DeliveryMyShipmentsPage />} />
          <Route path="/delivery/profile" element={<DeliveryProfilePage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<div>403 - Not authorized</div>} />
      <Route path="*" element={<div>404 - Not found</div>} />
    </Routes>
  );
};

export default AppRoutes;
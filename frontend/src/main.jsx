import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store.js";
import { fetchCurrentUser } from "./store/slices/authSlice.js";
import { fetchCart } from "./store/slices/cartSlice.js";
import { fetchWishlist } from "./store/slices/wishlistSlice.js";
import { useSelector } from "react-redux";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/index.css";

const AppBootstrap = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Runs once on load — this is what checks "is there already a
  // valid session cookie?" before any protected route renders.
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Fetch cart and wishlist automatically when the user is authenticated (login or page load)
  // Only for customers, as sellers and admins don't have carts and the API will reject
  useEffect(() => {
    if (isAuthenticated && user?.role === "CUSTOMER") {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, user]);

  return <AppRoutes />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ErrorBoundary>
          <AppBootstrap />
          <Toaster position="top-right" />
        </ErrorBoundary>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
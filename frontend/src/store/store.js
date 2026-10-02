import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import cartReducer from "./slices/cartSlice.js";
import addressReducer from "./slices/addressSlice.js";
import checkoutReducer from "./slices/checkoutSlice.js";
import orderReducer from "./slices/orderSlice.js";
import wishlistReducer from "./slices/wishlistSlice.js";
import paymentReducer from "./slices/paymentSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    address: addressReducer,
    checkout: checkoutReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
    payment: paymentReducer,
  },
});
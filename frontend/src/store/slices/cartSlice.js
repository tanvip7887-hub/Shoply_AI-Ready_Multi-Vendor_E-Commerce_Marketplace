import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "../../api/cart.api.js";
import toast from "react-hot-toast";

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const response = await cartApi.getCart();
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || "Failed to load cart");
  }
});

export const addToCart = createAsyncThunk("cart/addToCart", async (payload, { dispatch, rejectWithValue }) => {
  try {
    await cartApi.addItem(payload);
    dispatch(fetchCart());
    toast.success("Added to cart");
    return true;
  } catch (error) {
    return rejectWithValue(error.message || "Failed to add to cart");
  }
});

export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ id, quantity }, { dispatch, rejectWithValue }) => {
  try {
    await cartApi.updateItem(id, { quantity });
    dispatch(fetchCart());
    return true;
  } catch (error) {
    // Reload cart to revert optimistic UI if failed
    dispatch(fetchCart());
    return rejectWithValue(error.message || "Failed to update quantity");
  }
});

export const removeCartItem = createAsyncThunk("cart/removeCartItem", async (id, { dispatch, rejectWithValue }) => {
  try {
    await cartApi.removeItem(id);
    dispatch(fetchCart());
    toast.success("Item removed");
    return id;
  } catch (error) {
    return rejectWithValue(error.message || "Failed to remove item");
  }
});

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { dispatch, rejectWithValue }) => {
  try {
    await cartApi.clear();
    dispatch(fetchCart());
    toast.success("Cart cleared");
    return true;
  } catch (error) {
    return rejectWithValue(error.message || "Failed to clear cart");
  }
});

const initialState = {
  cartId: null,
  items: [],
  totalItems: 0,
  totalQuantity: 0,
  cartSubtotal: 0,
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartId = action.payload.cartId;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalQuantity = action.payload.totalQuantity || 0;
        state.cartSubtotal = action.payload.cartSubtotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;

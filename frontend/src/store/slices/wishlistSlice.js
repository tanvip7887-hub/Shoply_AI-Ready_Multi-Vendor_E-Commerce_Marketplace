import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistApi } from "../../api/wishlist.api.js";
import toast from "react-hot-toast";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await wishlistApi.add(productId);
      toast.success("Added to wishlist");
      dispatch(fetchWishlist());
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await wishlistApi.remove(productId);
      toast.success("Removed from wishlist");
      dispatch(fetchWishlist());
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove from wishlist");
    }
  }
);

const initialState = {
  items: [],
  count: 0,
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
        state.count = state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;

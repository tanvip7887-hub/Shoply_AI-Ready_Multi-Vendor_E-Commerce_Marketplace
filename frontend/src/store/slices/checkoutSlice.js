import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { checkoutApi } from "../../api/checkout.api.js";

export const fetchCheckout = createAsyncThunk(
  "checkout/fetchCheckout",
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await checkoutApi.getCheckout(addressId);
      return response.data; // Unwrapped by interceptor
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load checkout data");
    }
  }
);

const initialState = {
  checkoutData: null,
  isLoading: false,
  error: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCheckout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.checkoutData = action.payload;
      })
      .addCase(fetchCheckout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default checkoutSlice.reducer;

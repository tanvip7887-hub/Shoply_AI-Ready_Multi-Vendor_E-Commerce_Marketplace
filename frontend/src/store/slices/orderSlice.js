import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderApi } from "../../api/order.api.js";

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async ({ addressId, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await orderApi.createOrder({ addressId, paymentMethod });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create order");
    }
  }
);

const initialState = {
  isCreating: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;

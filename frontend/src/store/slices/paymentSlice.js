import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentApi } from "../../api/payment.api.js";

export const createMockPayment = createAsyncThunk(
  "payment/createMockPayment",
  async (orderIds, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createMockPayment(orderIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to initialize payment");
    }
  }
);

export const verifyMockPayment = createAsyncThunk(
  "payment/verifyMockPayment",
  async ({ paymentReference, status }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.verifyMockPayment(paymentReference, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Payment verification failed");
    }
  }
);

const initialState = {
  isProcessing: false,
  paymentDetails: null, // { paymentReference, totalAmount }
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentState: (state) => {
      state.isProcessing = false;
      state.paymentDetails = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createMockPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(createMockPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.paymentDetails = action.payload;
      })
      .addCase(createMockPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })
      // Verify
      .addCase(verifyMockPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(verifyMockPayment.fulfilled, (state) => {
        state.isProcessing = false;
        state.paymentDetails = null; // Clear on completion
      })
      .addCase(verifyMockPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;

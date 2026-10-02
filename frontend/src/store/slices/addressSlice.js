import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addressApi } from "../../api/address.api.js";
import toast from "react-hot-toast";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressApi.getAddresses();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (addressData, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressApi.createAddress(addressData);
      toast.success("Address created successfully");
      dispatch(fetchAddresses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await addressApi.updateAddress(id, data);
      toast.success("Address updated successfully");
      dispatch(fetchAddresses());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await addressApi.deleteAddress(id);
      toast.success("Address deleted successfully");
      dispatch(fetchAddresses());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  "address/setDefaultAddress",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await addressApi.setDefaultAddress(id);
      toast.success("Default address updated");
      dispatch(fetchAddresses());
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  addresses: [],
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default addressSlice.reducer;

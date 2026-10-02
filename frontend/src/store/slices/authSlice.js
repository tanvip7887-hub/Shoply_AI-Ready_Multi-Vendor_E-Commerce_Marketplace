import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/auth.api.js";

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (err) {
    return rejectWithValue(err?.message || "Authentication check failed");
  }
});

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.login(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue({ message: err?.message || "Something went wrong" });
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (err) {
    return rejectWithValue({ message: err?.message || "Something went wrong" });
  }
});

export const verifyEmail = createAsyncThunk("auth/verifyEmail", async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.verifyEmail(payload);
    return res.data;
  } catch (err) {
    return rejectWithValue({ message: err?.message || "Verification failed" });
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    status: "idle", // idle | loading | succeeded | failed
    bootstrapped: false, // has the initial /auth/me check completed?
  },
  reducers: {
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.bootstrapped = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "failed";
        state.bootstrapped = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        // Do not set isAuthenticated = true on register; user must verify OTP first
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});


export const { updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
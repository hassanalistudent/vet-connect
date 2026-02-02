import { createSlice } from "@reduxjs/toolkit";

// ✅ Initial state: load userInfo from localStorage if available
const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Set credentials after login/register
    setCredentials: (state, action) => {
      state.userInfo = action.payload;

      // Save to localStorage
      localStorage.setItem("userInfo", JSON.stringify(action.payload));

      // Optional: store expiration time (30 days ahead)
      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("expirationTime", expirationTime);
    },

    // ✅ Logout user
    logout: (state) => {
      state.userInfo = null;

      // Remove only auth-related keys
      localStorage.removeItem("userInfo");
      localStorage.removeItem("expirationTime");
    },
  },
});

// ✅ Export actions and reducer
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
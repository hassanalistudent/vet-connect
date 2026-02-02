import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";

// ✅ Only keep auth slice for user state
import authReducer from "./features/auth/authSlice.js";

const store = configureStore({
  reducer: {
    // Authentication state
    auth: authReducer,

    // RTK Query API slice
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),

  devTools: true,
});

setupListeners(store.dispatch);

export default store;
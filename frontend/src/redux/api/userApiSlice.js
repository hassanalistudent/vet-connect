import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔑 Login
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),

    // 🚪 Logout
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),

    // 📝 Register new user
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),

    // 👤 Get current user profile
    getProfile: builder.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✏️ Update current user profile
    updateProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),

    // ➕ Create doctor/pet owner profile
    createProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "POST",
        body: data,
      }),
    }),

    // 👥 Get all users (Admin only)
    getUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    // ❌ Delete user (Admin only)
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
    }),

    // 🔍 Get user details by ID (Admin only)
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    // ✏️ Update user by ID (Admin only)
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // 👨‍⚕️ Get doctors
    getDoctors: builder.query({
      query: () => ({
        url: `${USERS_URL}/doctors`,
        method: "GET",
      }),
      providesTags: ["Doctor"],
      keepUnusedDataFor: 5,
    }),

    // 📧 Verify email
    verifyEmail: builder.query({
      query: ({ token, email }) => ({
        url: `${USERS_URL}/verify-email?token=${token}&email=${email}`,
        method: "GET",
      }),
    }),

    // 🔄 Resend verification email
    resendVerification: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/resend-verification`,
        method: "POST",
        body: { email },
      }),
    }),

    // 🔑 Forgot password
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: { email },
      }),
    }),

    // 🔑 Reset password
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `${USERS_URL}/reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),
    //check verified or not 
    checkVerified: builder.query({
      query: () => ({
        url: `${USERS_URL}/verify`,
        method: 'GET',
        credentials: 'include', // Sends cookies if using httpOnly
        // OR prepareHeaders for Bearer token
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
  useGetDoctorsQuery,
  useVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCheckVerifiedQuery
} = userApiSlice;
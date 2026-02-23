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

    createProfile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "POST",
        body: data,
      }),
    }),

    getUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
    }),

    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/${data.userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getDoctors: builder.query({
      query: () => ({
        url: `${USERS_URL}/doctors`,
        method: "GET",
      }),
      providesTags: ["Doctor"],
      keepUnusedDataFor: 5,
    }),


    verifyEmail: builder.query({
      query: ({ token, email }) => ({
        url: `${USERS_URL}/verify-email?token=${token}&email=${email}`,
        method: "GET",
      }),
    }),


    resendVerification: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/resend-verification`,
        method: "POST",
        body: { email },
      }),
    }),


    forgotPassword: builder.mutation({
      query: (email) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `${USERS_URL}/reset-password/${token}`,
        method: "POST",
        body: { password },
      }),
    }),

    checkVerified: builder.query({
      query: () => ({
        url: `${USERS_URL}/verify`,
        method: "GET",
        credentials: "include",
      }),
    }),

    addDoctorReview: builder.mutation({
      query: ({ id, data }) => ({
        url: `${USERS_URL}/${id}/add-doctor-review`,
        method: "POST",
        body: data, // { rating, comment }
      }),
    }),
    updateDoctorAvailability: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/doctors/availability`,
        method: "PUT",
        body: data, // { availableNow: true/false }
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
  useCheckVerifiedQuery,
  useAddDoctorReviewMutation,
  useUpdateDoctorAvailabilityMutation
} = userApiSlice;
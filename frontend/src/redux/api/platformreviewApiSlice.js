import { apiSlice } from "./apiSlice";
import { REVIEWS_URL } from "../constants";

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /api/reviews (admin/all reviews)
    getAllReviews: builder.query({
      query: () => ({
        url: REVIEWS_URL,
        method: "GET",
      }),
      providesTags: ["Reviews"],
    }),

    // ✅ GET /api/reviews/:id
    getReviewById: builder.query({
      query: (reviewId) => ({
        url: `${REVIEWS_URL}/${reviewId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Review", id }],
    }),

    // ✅ POST /api/reviews
    createReview: builder.mutation({
      query: (data) => ({
        url: REVIEWS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Reviews"],
    }),

    // ✅ DELETE /api/reviews/:id
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `${REVIEWS_URL}/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewApiSlice;
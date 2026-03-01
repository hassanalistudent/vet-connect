import { apiSlice } from "./apiSlice";
import { SUPPORT_URL } from "../constants";

export const supportApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ POST /api/support → Create ticket
    createTicket: builder.mutation({
      query: (data) => ({
        url: SUPPORT_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SupportTickets"],
    }),

    // ✅ GET /api/support → Get all tickets (admin)
    getAllTickets: builder.query({
      query: () => ({
        url: SUPPORT_URL,
        method: "GET",
      }),
      providesTags: ["SupportTickets"],
    }),

    // ✅ GET /api/support/:id → Get single ticket
    getTicketById: builder.query({
      query: (ticketId) => ({
        url: `${SUPPORT_URL}/${ticketId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "SupportTicket", id }],
    }),

    // ✅ PUT /api/support/:id → Update ticket (status/assignment)
    updateTicket: builder.mutation({
      query: ({ ticketId, ...data }) => ({
        url: `${SUPPORT_URL}/${ticketId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        "SupportTickets",
        { type: "SupportTicket", id: ticketId },
      ],
    }),

    // ✅ POST /api/support/:id/responses → Add response
    addResponse: builder.mutation({
      query: ({ ticketId, message }) => ({
        url: `${SUPPORT_URL}/${ticketId}/responses`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        "SupportTickets",
        { type: "SupportTicket", id: ticketId },
      ],
    }),

    // ✅ GET /api/support/mytickets → Get logged-in user's tickets
    getUserTickets: builder.query({
      query: () => ({
        url: `${SUPPORT_URL}/mytickets`,
        method: "GET",
      }),
      providesTags: ["SupportTickets"],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketMutation,
  useAddResponseMutation,
  useGetUserTicketsQuery,
} = supportApiSlice;
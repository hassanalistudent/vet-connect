// src/redux/api/appointmentApiSlice.js
import { apiSlice } from "./apiSlice";
import { APPOINTMENTS_URL } from "../constants";

export const appointmentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/appointments (create)
    createAppointment: builder.mutation({
      query: (data) => ({
        url: APPOINTMENTS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Appointments"],
    }),

    // GET /api/appointments (admin, with optional query filters)
    getAppointments: builder.query({
      query: (params) => ({
        url: APPOINTMENTS_URL,
        method: "GET",
        params, // eg { doctorId, ownerId, status }
      }),
      providesTags: ["Appointments"],
    }),

    // GET /api/appointments/doctor (logged‑in doctor)
    getDoctorAppointments: builder.query({
      query: (params) => ({
        url: `${APPOINTMENTS_URL}/doctor`,
        method: "GET",
        params, // optional { status }
      }),
      providesTags: ["Appointments"],
    }),

    // GET /api/appointments/owner (logged‑in pet owner)
    getOwnerAppointments: builder.query({
      query: (params) => ({
        url: `${APPOINTMENTS_URL}/owner`,
        method: "GET",
        params, // optional { status }
      }),
      providesTags: ["Appointments"],
    }),

    // GET /api/appointments/:id
    getAppointmentDetails: builder.query({
      query: (appointmentId) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Appointment", id }],
    }),

    // PUT /api/appointments/:id (cancel / deleteOrCancelAppointment)
    cancelAppointment: builder.mutation({
      query: (appointmentId) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    // PUT /api/appointments/:id/doctor-response
    doctorResponse: builder.mutation({
      query: ({ appointmentId, ...data }) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}/doctor-response`,
        method: "PUT",
        body: data, // { status, appointmentDate, appointmentTime }
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        "Appointments",
        { type: "Appointment", id: appointmentId },
      ],
    }),

    // PUT /api/appointments/:id/owner-response
    ownerResponse: builder.mutation({
      query: ({ appointmentId, ...data }) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}/owner-response`,
        method: "PUT",
        body: data, // { status }
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        "Appointments",
        { type: "Appointment", id: appointmentId },
      ],
    }),

    // PUT /api/appointments/:id/pay
    markAppointmentPaid: builder.mutation({
      query: ({ appointmentId, isPaid }) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}/pay`,
        method: "PUT",
        body: { isPaid },
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        "Appointments",
        { type: "Appointment", id: appointmentId },
      ],
    }),

    // PUT /api/appointments/:id/complete
    completeAppointment: builder.mutation({
      query: ({ appointmentId, ...data }) => ({
        url: `${APPOINTMENTS_URL}/${appointmentId}/complete`,
        method: "PUT",
        body: data, // { diagnosis, treatment, prescriptions }
      }),
      invalidatesTags: (result, error, { appointmentId }) => [
        "Appointments",
        { type: "Appointment", id: appointmentId },
      ],
    }),
  }),
});

export const {
  useCreateAppointmentMutation,
  useGetAppointmentsQuery,
  useGetDoctorAppointmentsQuery,
  useGetOwnerAppointmentsQuery,
  useGetAppointmentDetailsQuery,
  useCancelAppointmentMutation,
  useDoctorResponseMutation,
  useOwnerResponseMutation,
  useMarkAppointmentPaidMutation,
  useCompleteAppointmentMutation,
} = appointmentApiSlice;

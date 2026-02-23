// frontend/src/redux/api/dashboardApiSlice.js
import { apiSlice } from "./apiSlice";
export const DASHBOARD_URL = "/api/dashboard";

export const dashboardApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // 🩺 Get Doctor Dashboard Analytics - MATCHES: GET /api/dashboard/doctor
        getDoctorDashboard: builder.query({
            query: () => ({
                url: `${DASHBOARD_URL}/doctor`,
                method: "GET",
            }),
            providesTags: ["DoctorDashboard"],
            keepUnusedDataFor: 300,
        }),

        // 📊 Get Doctor Dashboard Stats - MATCHES: GET /api/dashboard/doctor/stats
        getDoctorDashboardStats: builder.query({
            query: () => ({
                url: `${DASHBOARD_URL}/doctor/stats`,
                method: "GET",
            }),
            providesTags: ["DoctorDashboardStats"],
            keepUnusedDataFor: 60,
        }),

        // 📅 Get Doctor Appointment Trends - MATCHES: GET /api/dashboard/doctor/trends
        getDoctorAppointmentTrends: builder.query({
            query: ({ period = "week" }) => ({
                url: `${DASHBOARD_URL}/doctor/trends?period=${period}`,
                method: "GET",
            }),
            providesTags: ["DoctorTrends"],
        }),

        // 🔔 Get Doctor Alerts - MATCHES: GET /api/dashboard/doctor/alerts
        getDoctorAlerts: builder.query({
            query: () => ({
                url: `${DASHBOARD_URL}/doctor/alerts`,
                method: "GET",
            }),
            providesTags: ["DoctorAlerts"],
            keepUnusedDataFor: 30,
        }),

        // 🔄 Refresh Doctor Dashboard - MATCHES: POST /api/dashboard/doctor/refresh
        refreshDoctorDashboard: builder.mutation({
            query: () => ({
                url: `${DASHBOARD_URL}/doctor/refresh`,
                method: "POST",
            }),
            invalidatesTags: ["DoctorDashboard", "DoctorDashboardStats", "DoctorTrends", "DoctorAlerts"],
        }),
        // 🛠️ Get Admin Dashboard Analytics - MATCHES: GET /api/dashboard/admin
        getAdminDashboard: builder.query({
            query: ({ period = "week" }) => {
                const url = `${DASHBOARD_URL}/admin?period=${period}`;
                return {
                    url: url,
                    method: "GET",
                };
            },
            providesTags: ["AdminDashboard"],
        }),

        // ✅ Get Verification Queue - MATCHES: GET /api/dashboard/admin/verification-queue
        getVerificationQueue: builder.query({
            query: ({ page = 1, limit = 10 }) => ({
                url: `${DASHBOARD_URL}/admin/verification-queue?page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["VerificationQueue"],
            keepUnusedDataFor: 0,
        }),

        // 🏆 Get Top Doctors - MATCHES: GET /api/dashboard/admin/top-doctors
        getTopDoctors: builder.query({
            query: ({ limit = 5 }) => ({
                url: `${DASHBOARD_URL}/admin/top-doctors?limit=${limit}`,
                method: "GET",
            }),
            providesTags: ["TopDoctors"],
        }),

        // 🔄 Refresh Admin Dashboard - MATCHES: POST /api/dashboard/admin/refresh
        refreshAdminDashboard: builder.mutation({
            query: () => ({
                url: `${DASHBOARD_URL}/admin/refresh`,
                method: "POST",
            }),
            invalidatesTags: ["AdminDashboard", "VerificationQueue", "TopDoctors"],
        }),
    }),
});

export const {
    // Doctor Dashboard Hooks
    useGetDoctorDashboardQuery,
    useGetDoctorDashboardStatsQuery,
    useGetDoctorAppointmentTrendsQuery,
    useGetDoctorAlertsQuery,
    useRefreshDoctorDashboardMutation,

    // Admin Dashboard Hooks
    useGetAdminDashboardQuery,
    useGetVerificationQueueQuery,
    useGetTopDoctorsQuery,
    useRefreshAdminDashboardMutation,
} = dashboardApiSlice;
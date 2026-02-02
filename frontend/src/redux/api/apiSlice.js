import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',   // ✅ send cookies with every request
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: [
    'User',          // for login, register, admin user management
    'Profile',       // for doctor/pet owner profile
    'Doctor',        // for doctor-specific data
    'PetOwner',      // for pet owner-specific data
    'Pet',           // for pets CRUD
    'Appointment',   // for scheduling visits
    'MedicalHistory' // for pet medical records
  ],
  endpoints: () => ({}),
});

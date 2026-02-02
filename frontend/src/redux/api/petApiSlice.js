// src/redux/api/petApiSlice.js
import { apiSlice } from "./apiSlice";
import { PETS_URL } from "../constants";

export const petApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/pets (admin)
    getPets: builder.query({
      query: () => ({
        url: PETS_URL,
        method: "GET",
      }),
      providesTags: ["Pets"],
    }),

    // GET /api/pets/:id
    getPetDetails: builder.query({
      query: (petId) => ({
        url: `${PETS_URL}/${petId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Pet", id }],
    }),

    // POST /api/pets
    createPet: builder.mutation({
      query: (data) => ({
        url: PETS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pets"],
    }),

    // PUT /api/pets/:id
    updatePet: builder.mutation({
      query: ({ petId, ...data }) => ({
        url: `${PETS_URL}/${petId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { petId }) => [
        "Pets",
        { type: "Pet", id: petId },
      ],
    }),

    // DELETE /api/pets/:id
    deletePet: builder.mutation({
      query: (petId) => ({
        url: `${PETS_URL}/${petId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pets"],
    }),

    // GET /api/users/:id/pets
    getUserPets: builder.query({
      query: (userId) => ({
        url: `${PETS_URL}/mypets`,
        method: "GET",
      }),
      providesTags: ["Pets"],
    }),
  }),
});

export const {
  useGetPetsQuery,
  useGetPetDetailsQuery,
  useCreatePetMutation,
  useUpdatePetMutation,
  useDeletePetMutation,
  useGetUserPetsQuery,
} = petApiSlice;

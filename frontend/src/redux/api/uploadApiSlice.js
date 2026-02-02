import { apiSlice } from "./apiSlice";
import { UPLOADS_URL } from "../constants";


export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // UploadURL
    uploadImage:builder.mutation({
            query:(data)=>({
                url:`${UPLOADS_URL}`,
                method:"POST",
                body:data
            })
        }),
  }),
});

export const {
  useUploadImageMutation
} = userApiSlice;



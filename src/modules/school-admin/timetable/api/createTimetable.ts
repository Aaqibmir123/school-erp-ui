// import api from "@/src/services/api";

// /* CREATE (bulk) */
// export const saveTimetableApi = async (payload: any) => {
//   const res = await api.post("/school-admin/timetable", payload);
//   return res.data;
// };

// /* GET */
// export const getTimetableApi = async (
//   classId: string,
//   sectionId?: string, // ✅ optional
// ) => {
//   const res = await api.get(`/school-admin/timetable/${classId}`, {
//     params: {
//       sectionId, // query param
//     },
//   });

//   return res.data;
// };

// /* UPDATE SINGLE SLOT */
// export const updateTimetableApi = async (payload: any) => {
//   const res = await api.put("/school-admin/timetable/update", payload);
//   return res.data;
// };

import { baseApi } from "@/src/store/api/baseApi";

export const timetableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* GET */
    getTimetable: builder.query({
      query: ({ classId, sectionId }) => ({
        url: `/school-admin/timetable/${classId}`,
        params: { sectionId },
      }),

      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((item: any) => ({
                type: "Timetable" as const,
                id: item._id,
              })),
              { type: "Timetable", id: "LIST" },
            ]
          : [{ type: "Timetable", id: "LIST" }],
    }),

    /* CREATE */
    saveTimetable: builder.mutation({
      query: (body) => ({
        url: "/school-admin/timetable",
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "Timetable", id: "LIST" }],
    }),

    /* UPDATE */
    updateTimetable: builder.mutation({
      query: (body) => ({
        url: "/school-admin/timetable/update",
        method: "PUT",
        body,
      }),

      invalidatesTags: [{ type: "Timetable", id: "LIST" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetTimetableQuery,
  useSaveTimetableMutation,
  useUpdateTimetableMutation,
} = timetableApi;

import { baseApi } from "@/src/store/api/baseApi";
import {
  CreateTimetableDTO,
  TimetableItem,
} from "../../../../../shared-types/timetable.types";

type SaveTimetablePayload = CreateTimetableDTO[];

export const timetableApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* 🔥 GET TIMETABLE */
    getTimetable: builder.query<TimetableItem[], string>({
      query: (classId) => `/school-admin/timetable/${classId}`,
      transformResponse: (res: { data: TimetableItem[] }) => res.data,
      providesTags: ["Timetable"],
    }),

    /* 🔥 SAVE TIMETABLE */
    saveTimetable: builder.mutation<void, SaveTimetablePayload>({
      query: (data) => ({
        url: "/school-admin/timetable",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Timetable"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetTimetableQuery,
  useLazyGetTimetableQuery,
  useSaveTimetableMutation,
} = timetableApi;

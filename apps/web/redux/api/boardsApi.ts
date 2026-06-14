import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { signOut } from "next-auth/react";
import type { Connection, Shape } from "@canvus/shared";

// Module-level guard: only call signOut once even if multiple requests 401 at the same time.
let loggingOut = false;

const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api/boards", credentials: "include" });

/**
 * Wraps rawBaseQuery so that any 401 response is treated as an expired/invalid
 * session. When detected we sign the user out (clears the httpOnly cookie) and
 * redirect to the sign-in page with an `expired=1` flag so the page can show a
 * contextual message.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.error?.status === 401 && typeof window !== "undefined" && !loggingOut) {
    loggingOut = true;
    void signOut({ redirectTo: "/sign-in?expired=1" });
  }
  return result;
};

export type BoardListItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardSnapshotPayload = {
  id: string;
  shapes: Shape[];
  connections: Connection[];
  state: string;
  createdAt: string;
};

export type BoardWithSnapshot = BoardListItem & {
  snapshot: BoardSnapshotPayload | null;
};

export type SaveBoardArgs = {
  id: string;
  state: string;
  shapes: Shape[];
  connections: Connection[];
};

export const boardsApi = createApi({
  reducerPath: "boardsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Board"],
  endpoints: (b) => ({
    listBoards: b.query<BoardListItem[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Board" as const, id })),
              { type: "Board" as const, id: "LIST" },
            ]
          : [{ type: "Board" as const, id: "LIST" }],
    }),
    getBoard: b.query<BoardWithSnapshot, string>({
      query: (id) => `/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Board", id }],
    }),
    createBoard: b.mutation<BoardListItem, { name?: string }>({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: [{ type: "Board", id: "LIST" }],
    }),
    saveBoard: b.mutation<{ id: string; createdAt: string }, SaveBoardArgs>({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Board", id },
        { type: "Board", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useSaveBoardMutation,
} = boardsApi;

export const useGetBoardsQuery = boardsApi.useListBoardsQuery;

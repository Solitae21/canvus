import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Connection, Shape } from "@canvus/shared";

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
  baseQuery: fetchBaseQuery({ baseUrl: "/api/boards", credentials: "include" }),
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

import { createHmac } from "node:crypto";

type CreateBoardSocketTokenOptions = {
  boardId: string;
  roomId: string;
  userId: string;
};

const TOKEN_TTL_SECONDS = 60 * 60;

export const createBoardSocketToken = ({
  boardId,
  roomId,
  userId,
}: CreateBoardSocketTokenOptions): string => {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    throw new Error("INTERNAL_API_KEY is not set");
  }

  const payload = {
    boardId,
    roomId,
    userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", key).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
};

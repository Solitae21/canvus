import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@canvus/api/db";

const MAX_NAME_LENGTH = 120;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;

const normalizeName = (value: unknown): string => {
  if (typeof value !== "string") return "Untitled board";
  const trimmed = value.replace(CONTROL_CHARS_RE, "").trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : "Untitled board";
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    if (req.headers.get("content-length") !== "0") {
      body = await req.json();
    }
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = normalizeName((body as { name?: unknown })?.name);

  const board = await prisma.board.create({
    data: { name, ownerId: session.user.id },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json(board, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@canvus/api/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const board = await prisma.board.findFirst({
    where: { id, ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      snapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          shapes: true,
          connections: true,
          state: true,
          createdAt: true,
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const snapshot = board.snapshots[0] ?? null;

  return NextResponse.json({
    id: board.id,
    name: board.name,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
    snapshot: snapshot
      ? {
          id: snapshot.id,
          shapes: snapshot.shapes,
          connections: snapshot.connections,
          state: Buffer.from(snapshot.state).toString("base64"),
          createdAt: snapshot.createdAt,
        }
      : null,
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { state?: unknown; shapes?: unknown; connections?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body.state !== "string" ||
    !Array.isArray(body.shapes) ||
    !Array.isArray(body.connections)
  ) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const stateBytes = Buffer.from(body.state, "base64");
  if (stateBytes.length === 0) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  const owned = await prisma.board.findFirst({
    where: { id, ownerId: session.user.id },
    select: { id: true },
  });
  if (!owned) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [snapshot] = await prisma.$transaction([
    prisma.boardSnapshot.create({
      data: {
        boardId: id,
        authorId: session.user.id,
        shapes: body.shapes as never,
        connections: body.connections as never,
        state: stateBytes,
      },
      select: { id: true, createdAt: true },
    }),
    prisma.board.update({
      where: { id },
      data: {},
      select: { id: true },
    }),
  ]);

  return NextResponse.json({ id: snapshot.id, createdAt: snapshot.createdAt });
}

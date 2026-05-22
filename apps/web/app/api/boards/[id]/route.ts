import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { internalApi } from "@/lib/internal-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const res = await internalApi(`/internal/boards/${encodeURIComponent(id)}`, {
    userId: session.user.id,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const res = await internalApi(`/internal/boards/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
    userId: session.user.id,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

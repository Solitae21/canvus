import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { internalApi } from "@/lib/internal-api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const res = await internalApi("/internal/boards", { userId: session.user.id });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

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

  const res = await internalApi("/internal/boards", {
    method: "POST",
    body,
    userId: session.user.id,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

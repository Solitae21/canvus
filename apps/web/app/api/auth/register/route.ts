import { NextResponse } from "next/server";
import { internalApi } from "@/lib/internal-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // The API validates and is the sole owner of DB writes; forward its response verbatim.
  const res = await internalApi("/internal/auth/register", {
    method: "POST",
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

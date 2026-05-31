import { NextResponse } from "next/server";
import { internalApi } from "@/lib/internal-api";
import { getClientIp } from "@/lib/client-ip";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // The API validates and is the sole owner of DB writes; forward its response verbatim.
  let res: Response;
  try {
    res = await internalApi("/internal/auth/register", {
      method: "POST",
      body,
      clientIp: getClientIp(request),
    });
  } catch {
    return NextResponse.json({ error: "API unavailable. Please try again." }, { status: 503 });
  }
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

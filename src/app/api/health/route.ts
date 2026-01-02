import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "micro-decision-trainer",
    time: new Date().toISOString(),
  });
}

import type { NextRequest } from "next/server";
import { yookassa } from "~/server/yookassa";

export async function POST(req: NextRequest) {
  const p = await yookassa.handlePurchase(req);
  if (!p) return new Response("404", { status: 404 });

  return new Response("ok", { status: 200 });
}

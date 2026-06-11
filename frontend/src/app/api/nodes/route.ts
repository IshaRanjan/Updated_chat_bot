import { NextRequest, NextResponse } from "next/server";
import { getChildren } from "@/lib/server/faqService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const parentId = request.nextUrl.searchParams.get("parentId") ?? null;
    const normalizedParentId =
      parentId === "null" || parentId === "" ? null : parentId;

    const nodes = await getChildren(normalizedParentId);
    return NextResponse.json({ nodes });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch nodes",
      },
      { status: 500 }
    );
  }
}

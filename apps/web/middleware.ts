import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function middleware(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";

  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/devices/:path*"],
};

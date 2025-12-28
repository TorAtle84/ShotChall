import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/signup", "/auth/verify"];
const PUBLIC_API_PATHS = ["/api/cron/cleanup-unverified"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public API paths
  if (PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Check for Supabase auth cookie (sb-*-auth-token)
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (cookie) => cookie.name.includes("-auth-token") && cookie.value
  );

  // If no auth cookie and not a public path, redirect to login
  if (!hasAuthCookie && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("error", "Please sign in to continue.");
    return NextResponse.redirect(loginUrl);
  }

  // If has auth cookie and trying to access login/signup, redirect to home
  if (
    hasAuthCookie &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))
  ) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


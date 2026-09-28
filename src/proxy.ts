import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes — always accessible
  const publicRoutes = ["/", "/login", "/request-access"];
  const isPublic = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // Auth routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/practice") ||
      pathname.startsWith("/questions") || pathname.startsWith("/mock-exams") ||
      pathname.startsWith("/tutor") || pathname.startsWith("/mistakes") ||
      pathname.startsWith("/performance") || pathname.startsWith("/profile")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Access check done server-side in each page/layout
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Role check done in admin layout
  }

  // Redirect logged-in users away from login
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

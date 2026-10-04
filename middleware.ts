import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (SUPPORTED_LOCALES as readonly string[]).includes(cookie)) return cookie;
  const accept = request.headers.get("accept-language") ?? "";
  if (accept.startsWith("ar")) return "ar";
  if (accept.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next({ request });
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!pathnameHasLocale) {
    const locale = detectLocale(request);
    const redirectUrl = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  const lang = pathname.split("/")[1];
  const pathWithoutLang = "/" + pathname.split("/").slice(2).join("/");

  if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH) {
    if (pathWithoutLang === "/login") {
      return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const protectedPrefixes = [
    "/dashboard", "/practice", "/questions", "/mock-exams",
    "/tutor", "/mistakes", "/performance", "/profile", "/admin",
  ];
  const isProtected = protectedPrefixes.some((p) => pathWithoutLang.startsWith(p));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
  }

  if (pathWithoutLang === "/login" && user) {
    return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

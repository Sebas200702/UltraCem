import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { errorMessages } from '@/lib/error-handler';

function isProtectedAdminPage(pathname: string): boolean {
  return pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/admin/logout');
}

function isProtectedAdminApi(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname.startsWith('/api/admin')) return true;
  if (pathname === '/api/products' && method === 'POST') return true;
  if (/^\/api\/products\/[^/]+$/.test(pathname) && ['PUT', 'DELETE'].includes(method)) return true;
  if (/^\/api\/products\/[^/]+\/price-history$/.test(pathname)) return true;

  return false;
}

function unauthorizedJson(status: 401 | 403) {
  const code = status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN';

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: errorMessages[code],
      },
    },
    { status },
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const requiresAdminPage = isProtectedAdminPage(pathname);
  const requiresAdminApi = isProtectedAdminApi(request);

  if (!requiresAdminPage && !requiresAdminApi) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return requiresAdminApi ? unauthorizedJson(401) : NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (requiresAdminApi) return unauthorizedJson(401);

    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user.app_metadata?.role !== 'admin') {
    if (requiresAdminApi) return unauthorizedJson(403);

    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/products/:path*', '/api/products'],
};

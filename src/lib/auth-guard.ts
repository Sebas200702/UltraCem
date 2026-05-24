import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { errorMessages } from '@/lib/error-handler';

export type AdminGuardResult =
  | { user: User }
  | { response: NextResponse };

export function isAdminUser(user: User | null): user is User {
  return user?.app_metadata?.role === 'admin';
}

export async function getOptionalAdminUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !isAdminUser(data.user)) {
    return null;
  }

  return data.user;
}

export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: errorMessages.UNAUTHORIZED,
          },
        },
        { status: 401 },
      ),
    };
  }

  if (!isAdminUser(data.user)) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: errorMessages.FORBIDDEN,
          },
        },
        { status: 403 },
      ),
    };
  }

  return { user: data.user };
}

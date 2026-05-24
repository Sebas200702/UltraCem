import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse, type NextRequest } from 'next/server';
import { errorMessages } from '@/lib/error-handler';

interface RateLimitResult {
  success: boolean;
  reset?: number;
}

interface RateLimiter {
  limit: (identifier: string) => Promise<RateLimitResult>;
}

class NoopRateLimiter implements RateLimiter {
  async limit(): Promise<RateLimitResult> {
    return { success: true };
  }
}

function getIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip');

  return ip || 'anonymous';
}

function createRateLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`): RateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return new NoopRateLimiter();
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

export const chatRateLimiter = createRateLimiter(20, '10 m');
export const calcRateLimiter = createRateLimiter(60, '10 m');
export const adminRateLimiter = createRateLimiter(30, '10 m');

export async function enforceRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
): Promise<NextResponse | null> {
  const result = await limiter.limit(getIdentifier(request));

  if (result.success) {
    return null;
  }

  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: errorMessages.RATE_LIMIT_EXCEEDED,
      },
    },
    { status: 429 },
  );

  if (result.reset) {
    response.headers.set('X-RateLimit-Reset', String(result.reset));
  }

  return response;
}

import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export default withMiddlewareAuthRequired();

export const config = {
  matcher: ['/onboarding', '/welcome', '/chat', '/dashboard', '/people/:path*', '/memories', '/health', '/integrations'],
};

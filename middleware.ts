import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  '/companions/new(.*)',
  '/sessions(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/favicon.ico',
]);

const isWebhookRoute = createRouteMatcher([
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isWebhookRoute(req) && !isPublicRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except static files
    '/(api|trpc)(.*)',
  ],
};
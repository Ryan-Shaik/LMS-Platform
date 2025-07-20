import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default async function Navbar() {
  const user = await currentUser();
  const userId = user?.id;

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={ROUTES.HOME} className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">LMS Platform</h1>
            </Link>
            
            {userId && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href={ROUTES.COMPANIONS}
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Companions
                </Link>
                <Link
                  href={ROUTES.SESSIONS}
                  className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium"
                >
                  Sessions
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {userId ? (
              <>
                <Link href={ROUTES.PROFILE}>
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <UserButton afterSignOutUrl={ROUTES.HOME} />
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href={ROUTES.SIGN_IN}>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.SIGN_UP}>
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
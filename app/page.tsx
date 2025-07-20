import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Clock, Star } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Learn with AI-Powered
          <span className="text-primary block">Tutors</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create personalized AI companions that adapt to your learning style. 
          Get instant feedback, practice conversations, and master any subject.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {userId ? (
            <>
              <Link href={ROUTES.DASHBOARD}>
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href={ROUTES.COMPANIONS}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Companions
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href={ROUTES.SIGN_UP}>
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href={ROUTES.SIGN_IN}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="text-center">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Personalized Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              AI tutors adapt to your learning pace and style for optimal results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Create Companions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Build custom AI tutors for any subject with your preferred teaching style.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Track Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Monitor your learning journey with detailed session history and analytics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Star className="w-12 h-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-lg">Quality Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              Access high-quality educational content across multiple subjects.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      {!userId && (
        <section className="bg-primary text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of learners who are already using AI tutors to achieve their goals.
          </p>
          <Link href={ROUTES.SIGN_UP}>
            <Button size="lg" variant="secondary">
              Start Learning Today
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
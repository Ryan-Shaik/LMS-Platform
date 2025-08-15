import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingTable } from "@clerk/nextjs";

export default async function PricingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Choose Your Learning Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the full potential of AI-powered learning with our flexible subscription plans.
        </p>
      </div>

      {/* Clerk Pricing Table */}
      <div className="max-w-6xl mx-auto">
        <PricingTable />
      </div>
    </div>
  );
}
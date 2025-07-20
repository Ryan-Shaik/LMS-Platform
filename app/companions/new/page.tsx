import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompanionForm from "@/views/forms/CompanionForm";
import { ROUTES } from "@/lib/constants";

export default async function NewCompanionPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create AI Companion</h1>
        <p className="text-gray-600 mt-2">
          Design your personalized AI tutor with custom teaching style and subject expertise.
        </p>
      </div>
      
      <CompanionForm />
    </div>
  );
}
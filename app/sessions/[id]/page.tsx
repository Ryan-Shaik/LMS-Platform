import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getLearningSession } from "@/controllers/LearningSessionController";
import { getCompanionById } from "@/controllers/CompanionController";
import { ROUTES } from "@/lib/constants";
import LearningSessionInterface from "@/views/components/LearningSessionInterface";

interface LearningSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function LearningSessionPage({ params }: LearningSessionPageProps) {
  const { userId } = await auth();
  const { id } = await params;
  
  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const sessionResult = await getLearningSession(id);
  
  if (!sessionResult.success || !sessionResult.data) {
    notFound();
  }

  const session = sessionResult.data;
  
  // Get companion details
  const companionResult = await getCompanionById(session.companionId);
  
  if (!companionResult.success || !companionResult.data) {
    notFound();
  }

  const companion = companionResult.data;

  return (
    <div className="min-h-screen bg-gray-50">
      <LearningSessionInterface 
        session={session}
        companion={companion}
      />
    </div>
  );
}
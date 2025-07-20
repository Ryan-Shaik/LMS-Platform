import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCompanionById } from "@/controllers/CompanionController";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, BookOpen, Mic, MessageSquare } from "lucide-react";
import { getSubjectColor, formatDuration } from "@/lib/utils";
import StartLearningButton from "@/views/components/StartLearningButton";

interface CompanionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanionDetailPage({ params }: CompanionDetailPageProps) {
  const { userId } = await auth();
  const { id } = await params;
  
  const companionResult = await getCompanionById(id);
  
  if (!companionResult.success || !companionResult.data) {
    notFound();
  }

  const companion = companionResult.data;
  const subjectColor = getSubjectColor(companion.subject);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Badge 
            variant="secondary" 
            style={{ backgroundColor: subjectColor }}
            className="text-white"
          >
            {companion.subject}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {formatDuration(companion.duration)}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">{companion.name}</h1>
        
        <p className="text-xl text-gray-600">{companion.topic}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          {companion.instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Teaching Approach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {companion.instructions}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What You'll Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Interactive Learning</h4>
                    <p className="text-sm text-gray-600">
                      Engage in real-time conversations with your AI tutor
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Mic className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Voice Interaction</h4>
                    <p className="text-sm text-gray-600">
                      Natural voice conversations with {companion.voice} voice
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Personalized Style</h4>
                    <p className="text-sm text-gray-600">
                      {companion.style.charAt(0).toUpperCase() + companion.style.slice(1)} teaching approach
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Focused Sessions</h4>
                    <p className="text-sm text-gray-600">
                      {companion.duration}-minute structured learning sessions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start Learning Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Learn?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Start a {companion.duration}-minute learning session with {companion.name}.</p>
                <p className="mt-2">You'll have an interactive conversation about {companion.topic}.</p>
              </div>
              
              {userId ? (
                <StartLearningButton 
                  companionId={companion.id}
                  companionName={companion.name}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Sign in to start learning</p>
                  <a 
                    href="/sign-in" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  >
                    Sign In to Start
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Companion Details */}
          <Card>
            <CardHeader>
              <CardTitle>Companion Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subject:</span>
                <span className="text-sm font-medium">{companion.subject}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Voice:</span>
                <span className="text-sm font-medium capitalize">{companion.voice}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Style:</span>
                <span className="text-sm font-medium capitalize">{companion.style}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{companion.duration} minutes</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Visibility:</span>
                <span className="text-sm font-medium">
                  {companion.isPublic ? "Public" : "Private"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
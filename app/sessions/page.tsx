import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Star, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Plus
} from "lucide-react";
import { getUserLearningSessions, getLearningStats } from "@/controllers/LearningSessionController";
import { ROUTES } from "@/lib/constants";
import { getSubjectColor } from "@/lib/utils";

export default async function SessionsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect(ROUTES.SIGN_IN);
  }

  const [sessionsResult, statsResult] = await Promise.all([
    getUserLearningSessions(20),
    getLearningStats()
  ]);

  const sessions = sessionsResult.data || [];
  const stats = statsResult.data || {
    totalSessions: 0,
    totalDuration: 0,
    averageRating: 0,
    completedSessions: 0
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Sessions</h1>
          <p className="text-gray-600">Track your learning progress and session history.</p>
        </div>
        <Link href={ROUTES.COMPANIONS}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(stats.totalDuration)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session: any) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Badge 
                        style={{ 
                          backgroundColor: session.companions ? 
                            getSubjectColor(session.companions.subject) : 
                            '#6b7280' 
                        }}
                        className="text-white"
                      >
                        {session.companions?.subject || 'Unknown'}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {session.companions?.name || 'Unknown Companion'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.companions?.topic || 'No topic specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    {session.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                    )}
                    
                    {session.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{session.rating}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(session.startedAt)}</span>
                    </div>
                    
                    <Badge 
                      variant={session.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No learning sessions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start your first learning session with an AI companion.
              </p>
              <Link href={ROUTES.COMPANIONS}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Companions
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
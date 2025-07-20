import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Star } from "lucide-react";
import { SessionHistory } from "@/models/types";
import { getSubjectColor, formatDuration, formatDateTime } from "@/lib/utils";

interface SessionCardProps {
  session: SessionHistory & {
    companion?: {
      name: string;
      subject: string;
      topic: string;
    };
  };
}

export default function SessionCard({ session }: SessionCardProps) {
  const companion = session.companion;
  
  if (!companion) {
    return null;
  }

  const subjectColor = getSubjectColor(companion.subject);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge 
            variant="secondary"
            style={{ backgroundColor: subjectColor }}
          >
            {companion.subject}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDateTime(session.completedAt)}
          </div>
        </div>
        <CardTitle className="text-lg">{companion.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          {companion.topic}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {formatDuration(session.duration)}
          </div>
          
          {session.rating && (
            <div className="flex items-center text-sm text-yellow-600">
              <Star className="w-4 h-4 mr-1 fill-current" />
              {session.rating}/5
            </div>
          )}
        </div>
        
        {session.feedback && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <p className="text-gray-700">{session.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
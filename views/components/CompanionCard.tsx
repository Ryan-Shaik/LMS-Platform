import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { Companion } from "@/models/types";
import { getSubjectColor, formatDuration } from "@/lib/utils";

interface CompanionCardProps {
  companion: Companion;
  showAuthor?: boolean;
}

export default function CompanionCard({ companion, showAuthor = false }: CompanionCardProps) {
  const subjectColor = getSubjectColor(companion.subject);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge 
            variant="secondary" 
            className="mb-2"
            style={{ backgroundColor: subjectColor }}
          >
            {companion.subject}
          </Badge>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            {formatDuration(companion.duration)}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{companion.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {companion.topic}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{companion.style} style</span>
          <span className="capitalize">{companion.voice} voice</span>
        </div>
        
        {showAuthor && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <User className="w-3 h-3 mr-1" />
            <span>By Author</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/companions/${companion.id}`} className="w-full">
          <Button className="w-full">
            Start Learning
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
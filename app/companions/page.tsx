import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getAllCompanions } from "@/controllers/CompanionController";
import CompanionCard from "@/views/components/CompanionCard";

interface SearchParams {
  subject?: string;
  topic?: string;
  page?: string;
}

interface CompanionsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CompanionsPage({ searchParams }: CompanionsPageProps) {
  const user = await currentUser();
  const params = await searchParams;
  
  const query = {
    subject: params.subject,
    topic: params.topic,
    page: params.page ? parseInt(params.page) : 1,
    limit: 12,
  };

  const companionsResult = await getAllCompanions(query);
  const companions = companionsResult.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Companions</h1>
          <p className="text-gray-600">Discover and learn with AI tutors created by the community.</p>
        </div>
        {user && (
          <Link href="/companions/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Companion
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject:
          </label>
          <select
            id="subject"
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            defaultValue={params.subject || ""}
          >
            <option value="">All Subjects</option>
            <option value="maths">Mathematics</option>
            <option value="science">Science</option>
            <option value="language">Language</option>
            <option value="history">History</option>
            <option value="coding">Coding</option>
            <option value="economics">Economics</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="search" className="text-sm font-medium">
            Search:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search topics..."
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
            defaultValue={params.topic || ""}
          />
        </div>
      </div>

      {/* Companions Grid */}
      {companions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companions.map((companion) => (
            <CompanionCard 
              key={companion.id} 
              companion={companion} 
              showAuthor={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No companions found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or create a new companion.
          </p>
          {user && (
            <Link href="/companions/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Companion
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
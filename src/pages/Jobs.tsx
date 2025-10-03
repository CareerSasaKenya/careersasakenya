import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Loader2 } from "lucide-react";

const Jobs = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover your next career opportunity
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                company={job.companies?.name || job.company}
                location={job.location}
                description={job.description}
                salary={job.salary || undefined}
                companyId={job.company_id}
                companyLogo={job.companies?.logo}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No jobs posted yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

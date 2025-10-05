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
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-primary bg-clip-text text-transparent px-4">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto px-4">
            Discover your next career opportunity from top companies in Kenya
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading opportunities...</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up">
            {jobs.map((job, index) => (
              <div key={job.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                <JobCard
                  id={job.id}
                  title={job.title}
                  company={job.companies?.name || job.company}
                  location={job.location}
                  description={job.description}
                  salary={job.salary || undefined}
                  companyId={job.company_id}
                  companyLogo={job.companies?.logo}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 animate-fade-in">
            <div className="inline-flex p-6 rounded-full bg-muted mb-6">
              <Loader2 className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mb-2">No jobs available yet</p>
            <p className="text-muted-foreground text-lg">
              Check back soon for new opportunities!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;

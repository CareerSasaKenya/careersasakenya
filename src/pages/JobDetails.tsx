import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, Mail, ExternalLink, Loader2 } from "lucide-react";

const JobDetails = () => {
  const { id } = useParams();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const handleApply = () => {
    if (job?.apply_email) {
      window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
    } else if (job?.apply_link) {
      window.open(job.apply_link, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-xl text-muted-foreground mb-4">Job not found</p>
          <Link to="/jobs">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/jobs">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>

        <Card className="border-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-lg">{job.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-lg">{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  <span className="text-lg font-medium text-foreground">{job.salary}</span>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="py-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {(job.apply_email || job.apply_link) && (
                <Button 
                  onClick={handleApply}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  {job.apply_email ? (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Apply via Email
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Apply Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobDetails;

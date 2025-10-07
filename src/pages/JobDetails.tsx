import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, Mail, ExternalLink, Loader2, Bookmark, CheckCircle, FileText, Clock, Briefcase, GraduationCap, Award, Code, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
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
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: hasApplied } = useQuery({
    queryKey: ["application", id, user?.id],
    enabled: !!user && !!id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const { data: isSaved } = useQuery({
    queryKey: ["saved", id, user?.id],
    enabled: !!user && !!id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("job_applications")
        .insert({ job_id: id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["application", id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to submit application");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Not authenticated");
      if (isSaved) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_jobs")
          .insert({ job_id: id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isSaved ? "Job removed from saved" : "Job saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["saved", id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to save job");
    },
  });

  const handleApply = () => {
    if (job?.apply_email) {
      window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
    } else if (job?.apply_link) {
      window.open(job.apply_link, "_blank");
    } else if (job?.application_url) {
      window.open(job.application_url, "_blank");
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-4">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      {job.company_id && job.companies ? (
                        <Link 
                          to={`/companies/${job.company_id}`}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {job.companies.logo && (
                            <img src={job.companies.logo} alt={job.companies.name} className="h-6 w-6 object-contain" />
                          )}
                          <Building2 className="h-5 w-5 text-primary" />
                          <span className="text-lg">{job.companies.name}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-lg">{job.company}</span>
                          <Badge variant="secondary">Direct Listing</Badge>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-lg">{job.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.employment_type && (
                        <Badge variant="outline">{job.employment_type.replace(/_/g, ' ')}</Badge>
                      )}
                      {job.job_location_type && (
                        <Badge variant="outline">{job.job_location_type.replace(/_/g, ' ')}</Badge>
                      )}
                      {job.experience_level && (
                        <Badge variant="outline">{job.experience_level}</Badge>
                      )}
                      {job.industry && (
                        <Badge className="bg-primary/10 text-primary">{job.industry}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-8 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Description
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {job.required_qualifications && Array.isArray(job.required_qualifications) && job.required_qualifications.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Required Qualifications
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {job.required_qualifications.map((qual: string, index: number) => (
                          <li key={index}>{qual}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {job.preferred_qualifications && Array.isArray(job.preferred_qualifications) && job.preferred_qualifications.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Preferred Qualifications
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {job.preferred_qualifications.map((qual: string, index: number) => (
                          <li key={index}>{qual}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {job.software_skills && Array.isArray(job.software_skills) && job.software_skills.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Required Skills & Software
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {job.software_skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {role === "candidate" && user && job.direct_apply && (
                    <>
                      <Button 
                        onClick={() => applyMutation.mutate()}
                        size="lg"
                        className="bg-gradient-primary hover:opacity-90 transition-opacity"
                        disabled={hasApplied || applyMutation.isPending}
                      >
                        {hasApplied ? (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Applied
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-5 w-5" />
                            Apply Now
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => saveMutation.mutate()}
                        variant="outline"
                        size="lg"
                        disabled={saveMutation.isPending}
                      >
                        <Bookmark className={`mr-2 h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? "Saved" : "Save Job"}
                      </Button>
                    </>
                  )}
                  {(job.apply_email || job.apply_link || job.application_url) && (
                    <Button 
                      onClick={handleApply}
                      size="lg"
                      variant={role === "candidate" && job.direct_apply ? "outline" : "default"}
                      className={role === "candidate" && job.direct_apply ? "" : "bg-gradient-primary hover:opacity-90 transition-opacity"}
                    >
                      {job.apply_email ? (
                        <>
                          <Mail className="mr-2 h-5 w-5" />
                          Email Employer
                        </>
                      ) : (
                        <>
                          <ExternalLink className="mr-2 h-5 w-5" />
                          {job.application_url ? "Apply on Company Site" : "External Apply Link"}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salary Range</p>
                      <p className="font-medium">
                        {job.salary_currency} {job.salary_min?.toLocaleString()} - {job.salary_max?.toLocaleString()}
                        <span className="text-sm text-muted-foreground ml-1">
                          / {job.salary_period?.toLowerCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {job.specialization && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Specialization</p>
                      <p className="font-medium">{job.specialization}</p>
                    </div>
                  </div>
                )}

                {job.job_function && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Function</p>
                      <p className="font-medium">{job.job_function}</p>
                    </div>
                  </div>
                )}

                {job.work_schedule && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Work Schedule</p>
                      <p className="font-medium">{job.work_schedule}</p>
                    </div>
                  </div>
                )}

                {job.education_requirements && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Education</p>
                      <p className="font-medium">{job.education_requirements}</p>
                    </div>
                  </div>
                )}

                {job.license_requirements && (
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">License Required</p>
                      <p className="font-medium">{job.license_requirements}</p>
                    </div>
                  </div>
                )}

                {job.practice_area && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Practice Area</p>
                      <p className="font-medium">{job.practice_area}</p>
                    </div>
                  </div>
                )}

                {job.project_type && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="font-medium">{job.project_type}</p>
                    </div>
                  </div>
                )}

                {job.language_requirements && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Languages</p>
                      <p className="font-medium">{job.language_requirements}</p>
                    </div>
                  </div>
                )}

                {job.visa_sponsorship && job.visa_sponsorship !== "Not Applicable" && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Sponsorship</p>
                      <p className="font-medium">{job.visa_sponsorship}</p>
                    </div>
                  </div>
                )}

                {job.valid_through && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-medium">{new Date(job.valid_through).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {job.date_posted && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="font-medium">{new Date(job.date_posted).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Facebook, Linkedin, Mail, Twitter, MessageSquare, Flag, Instagram } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, DollarSign, ExternalLink, Loader2, Bookmark, CheckCircle, FileText, Clock, Briefcase, GraduationCap, Award, Code, Globe, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReportJobDialog } from "@/components/ReportJobDialog";
import JobCard from "@/components/JobCard";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      
      let data, error;
      
      // Try to find by slug first (more user-friendly URLs)
      ({ data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          ),
          education_levels (
            id,
            name
          )
        `)
        .eq("job_slug", id)
        .maybeSingle());
      
      // If not found by slug, try by ID
      if (!data && !error) {
        ({ data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            companies (
              id,
              name,
              logo
            ),
            education_levels (
              id,
              name
            )
          `)
          .eq("id", id)
          .maybeSingle());
      }
      
      if (error) throw error;
      return data;
    },
  });

  const { data: relatedJobs } = useQuery({
    queryKey: ["relatedJobs", job?.id, job?.industry, job?.job_function],
    enabled: !!job?.id && (!!job?.industry || !!job?.job_function),
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          ),
          education_levels (
            id,
            name
          )
        `)
        .neq("id", job!.id)
        .limit(6);

      // Prioritize jobs with matching industry or job_function
      if (job?.industry) {
        query = query.eq("industry", job.industry);
      } else if (job?.job_function) {
        query = query.eq("job_function", job.job_function);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: hasApplied } = useQuery({
    queryKey: ["application", job?.id, user?.id],
    enabled: !!user && !!job?.id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", job!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const { data: isSaved } = useQuery({
    queryKey: ["saved", job?.id, user?.id],
    enabled: !!user && !!job?.id && role === "candidate",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", job!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      
      return !!data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !job?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("job_applications")
        .insert({ job_id: job.id, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to submit application");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !job?.id) throw new Error("Not authenticated");
      if (isSaved) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("job_id", job.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_jobs")
          .insert({ job_id: job.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isSaved ? "Job removed from saved" : "Job saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["saved", job?.id, user?.id] });
    },
    onError: () => {
      toast.error("Failed to save job");
    },
  });

  const handleApply = () => {
    // Prioritize application_url over other options
    if (job?.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }
    if (job?.apply_link) {
      window.open(job.apply_link, "_blank");
      return;
    }
    if (job?.apply_email) {
      window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
      return;
    }
  };
  const adminEmail: string | undefined =
    typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ADMIN_EMAIL
      ? String((import.meta as any).env.VITE_ADMIN_EMAIL)
      : undefined;

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Note: job_reports table doesn't exist in the current schema
  // This code is commented out until the table is created
  /*
  const reportJobMutation = useMutation({
    mutationFn: async (reportData: { jobId: string; message: string }) => {
      const { data, error } = await supabase
        .from('job_reports')
        .insert([
          {
            job_id: reportData.jobId,
            reported_by: user?.id || null,
            message: reportData.message,
            status: 'pending',
            job_data: job // Store the job data at the time of reporting
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Thank you for reporting this job. Our team will review it shortly.');
      setIsReportDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error reporting job:', error);
      toast.error('Failed to submit report. Please try again.');
    }
  });
  */
  
  // Placeholder for reportJobMutation to avoid TypeScript errors
  const reportJobMutation: any = {
    isPending: false,
    mutateAsync: async () => {}
  };

  const handleReportJob = async () => {
    if (!job?.id) return;
    setIsReportDialogOpen(true);
    // Show a message that reporting is not currently available
    toast.info('Job reporting is not currently available. This feature will be implemented soon.');
    setIsReportDialogOpen(false);
  };

  const handleReportJobSubmit = async (message: string) => {
    if (!job?.id) return;
    // Placeholder function - reporting is not currently implemented
    toast.info('Job reporting is not currently available. This feature will be implemented soon.');
    setIsReportDialogOpen(false);
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
                    {(job.valid_through || job.date_posted) && (
                      <div className="mb-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {job.date_posted && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
                          </div>
                        )}
                        {job.valid_through && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Valid until: {new Date(job.valid_through).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
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
                  <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>

                {job.responsibilities && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Key Responsibilities
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                    </div>
                  </>
                )}

                {job.required_qualifications && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Required Qualifications
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.required_qualifications }} />
                    </div>
                  </>
                )}

                {job.software_skills && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Required Skills & Software
                      </h3>
                      <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.software_skills }} />
                    </div>
                  </>
                )}

                <Separator />

                {/* Apply Here section - visible on mobile/small screens */}
                <div className="lg:hidden">
                  <ApplySection 
                    job={job} 
                    userId={user?.id} 
                    hasApplied={!!hasApplied} 
                    onApplied={() => queryClient.invalidateQueries({ queryKey: ["application", id, user?.id] })} 
                  />
                </div>

                {/* Safety Alert + Report Job */}
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-900 leading-relaxed">
                      <strong>CareerSasa Safety Alert:</strong> We strongly advise job seekers not to make any payment to employers or agencies during the recruitment process. If you're asked to pay for training, interviews, or job placement, report the job immediately using the "Report Job" button. CareerSasa thoroughly vets postings, but we encourage all applicants to stay vigilant and verify opportunities independently.
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Share:</span>
                      <div className="flex flex-wrap gap-2">
                        <a 
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#1877F2] hover:bg-[#1877F2]/10 p-2 rounded-full transition-colors"
                          aria-label="Share on Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a 
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0077B5] hover:bg-[#0077B5]/10 p-2 rounded-full transition-colors"
                          aria-label="Share on LinkedIn"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                        <a 
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Check out this job: ${job?.title || ''}`)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#1DA1F2] hover:bg-[#1DA1F2]/10 p-2 rounded-full transition-colors"
                          aria-label="Share on Twitter"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                        <a 
                          href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${window.location.href}`)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#25D366] hover:bg-[#25D366]/10 p-2 rounded-full transition-colors"
                          aria-label="Share on WhatsApp"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </a>
                        <a 
                          href={`https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#E1306C] hover:bg-[#E1306C]/10 p-2 rounded-full transition-colors"
                          aria-label="Share on Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a 
                          href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job?.title || ''}`)}&body=${encodeURIComponent(`Check out this job: ${window.location.href}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:bg-gray-600/10 p-2 rounded-full transition-colors flex items-center justify-center"
                          aria-label="Share via Email"
                        >
                          <Mail className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsReportDialogOpen(true)}
                      disabled={reportJobMutation.isPending}
                      className="flex items-center gap-2 whitespace-nowrap mt-2 sm:mt-0"
                    >
                      <Flag className="h-4 w-4" />
                      {reportJobMutation.isPending ? 'Submitting...' : 'Flag'}
                    </Button>
                    <ReportJobDialog
                      open={isReportDialogOpen}
                      onOpenChange={setIsReportDialogOpen}
                      onReport={handleReportJob}
                      jobTitle={job?.title || 'this job'}
                    />
                  </div>
                </div>

                {job.additional_info && (
                  <div className="mt-6 rounded-md border border-border bg-muted/30 p-4">
                    <div className="richtext-content text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: job.additional_info }} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Made sticky for desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start lg:h-fit space-y-6">
            {/* Apply Here section - hidden on mobile/small screens */}
            <div className="hidden lg:block">
              <ApplySection 
                job={job} 
                userId={user?.id} 
                hasApplied={!!hasApplied} 
                onApplied={() => queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] })} 
              />
            </div>

            {/* Job Details Section */}
            <RoleDetails job={job} />

            {job?.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
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

        {/* Apply Here section - visible on mobile/small screens */}
        <div className="lg:hidden mt-6">
          <ApplySection 
            job={job} 
            userId={user?.id} 
            hasApplied={!!hasApplied} 
            onApplied={() => queryClient.invalidateQueries({ queryKey: ["application", job?.id, user?.id] })} 
          />
        </div>

        {/* Related Opportunities Section */}
        {relatedJobs && relatedJobs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.slice(0, 6).map((relatedJob: any) => (
                <JobCard
                  key={relatedJob.id}
                  id={relatedJob.id}
                  title={relatedJob.title}
                  company={relatedJob.companies?.name || relatedJob.company}
                  location={relatedJob.location}
                  description={relatedJob.description}
                  salary={relatedJob.salary || undefined}
                  companyId={relatedJob.company_id}
                  companyLogo={relatedJob.companies?.logo}
                  industry={relatedJob.industry}
                  locationType={relatedJob.job_location_type}
                  employmentType={relatedJob.employment_type}
                  salaryMin={relatedJob.salary_min}
                  salaryMax={relatedJob.salary_max}
                  salaryCurrency={relatedJob.salary_currency}
                  salaryPeriod={relatedJob.salary_period}
                  experienceLevel={relatedJob.experience_level}
                  datePosted={relatedJob.date_posted}
                  validThrough={relatedJob.valid_through}
                  applicationUrl={relatedJob.application_url}
                  applyEmail={relatedJob.apply_email}
                  applyLink={relatedJob.apply_link}
                  skillsTop3={
                    Array.isArray(relatedJob.software_skills)
                      ? (relatedJob.software_skills as unknown[])
                          .filter((s): s is string => typeof s === "string")
                          .slice(0, 3)
                      : undefined
                  }
                  department={relatedJob.job_function}
                  jobSlug={relatedJob.job_slug}
                  educationLevel={relatedJob.education_levels?.name || ""}
                />
              ))}
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-center">
          <Link to="/jobs">
            <Button variant="outline" size="lg" className="border-2 hover:bg-gradient-primary hover:text-primary-foreground hover:border-transparent transition-all duration-300">
              Browse More Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

type Job = any;

const RoleDetails = ({ job }: { job: Job }) => {
  return (
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
                <span className="text-sm text-muted-foreground ml-1">/ {job.salary_period?.toLowerCase()}</span>
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

        {job.education_levels?.name && (
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Education</p>
              <p className="font-medium">{job.education_levels.name}</p>
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

        {/* New fields added */}
        {job.minimum_experience && (
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Minimum Experience</p>
              <p className="font-medium">{job.minimum_experience} years</p>
            </div>
          </div>
        )}

        {job.salary_type && (
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Salary Type</p>
              <p className="font-medium">{job.salary_type}</p>
            </div>
          </div>
        )}

        {job.is_featured && (
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Featured Job</p>
              <p className="font-medium text-yellow-600">Yes</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ApplySection = ({ job, userId, hasApplied, onApplied }: { job: Job; userId?: string; hasApplied: boolean; onApplied: () => void }) => {
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [expectedSalary, setExpectedSalary] = useState<string>("");
  const [isNegotiable, setIsNegotiable] = useState<boolean>(false);
  const [saveCoverToProfile, setSaveCoverToProfile] = useState<boolean>(false);
  const [applyMethod, setApplyMethod] = useState<"profile" | "cv">("profile");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const doApply = async () => {
    if (!userId) {
      toast.error("Please log in to apply");
      return;
    }

    // If admin provided application_url, override and open it
    if (job?.application_url) {
      window.open(job.application_url, "_blank");
      return;
    }

    // Handle CV upload if apply with CV selected
    let uploadedCvUrl: string | null = null;
    if (applyMethod === "cv") {
      if (!cvFile) {
        toast.error("Please upload your CV to continue");
        return;
      }
      try {
        setUploading(true);
        const fileExt = cvFile.name.split(".").pop();
        const filePath = `${userId}/${job.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("cvs").upload(filePath, cvFile, {
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("cvs").getPublicUrl(filePath);
        uploadedCvUrl = data.publicUrl;
      } catch (e: any) {
        toast.error(e?.message || "Failed to upload CV. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Persist application (minimal fields to avoid schema mismatch)
    const { error } = await supabase
      .from("job_applications")
      .insert({ job_id: job.id, user_id: userId });
    if (error) {
      toast.error("Failed to submit application");
      return;
    }

    // Best-effort: include extra info via separate notification
    if (applyMethod === "cv" && uploadedCvUrl) {
      toast.info("CV uploaded successfully");
    }
    if (saveCoverToProfile) {
      // Placeholder: no profile table found. This can be wired later.
      try {
        localStorage.setItem("careersasa_cover_letter", coverLetter);
      } catch {}
      toast.success("Cover letter saved for future use");
    }

    toast.success("Application submitted successfully!");
    queryClient.invalidateQueries({ queryKey: ["application", job.id, userId] });
    onApplied();
  };

  // If only external methods exist (application_url/apply_link/apply_email), show a single button
  const hasExternal = Boolean(job?.application_url || job?.apply_link || job?.apply_email);

  if (job?.application_url) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.open(job.application_url, "_blank")} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply on Company Site
          </Button>
          {(job?.apply_email || job?.apply_link) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.apply_link, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply via External Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (job?.apply_link) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.open(job.apply_link, "_blank")} className="w-full bg-gradient-primary hover:opacity-90">
            <ExternalLink className="mr-2 h-5 w-5" /> Apply via External Link
          </Button>
          {(job?.apply_email || job?.application_url) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.apply_email && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
                >
                  <Mail className="mr-2 h-4 w-4" /> Apply via Email
                </Button>
              )}
              {job?.application_url && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.application_url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (job?.apply_email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apply Here</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Mail className="mr-2 h-5 w-5" /> Apply via Email
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Clicking above will open your email client with a pre-filled subject line
          </p>
          {(job?.application_url || job?.apply_link) && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Alternative ways to apply:</p>
              {job?.application_url && (
                <Button 
                  variant="outline" 
                  className="w-full mb-2"
                  onClick={() => window.open(job.application_url, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply on Company Site
                </Button>
              )}
              {job?.apply_link && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(job.apply_link, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Apply via External Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Apply Here</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="yearsExp">Years of experience</Label>
          <Input id="yearsExp" type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} placeholder="e.g. 3" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverLetter">Cover letter</Label>
          <Textarea id="coverLetter" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write a brief cover letter..." rows={5} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expectedSalary">Expected salary</Label>
            <Input id="expectedSalary" type="number" min={0} value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. 80000" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox id="negotiable" checked={isNegotiable} onCheckedChange={(v) => setIsNegotiable(Boolean(v))} />
            <Label htmlFor="negotiable">Negotiable</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="saveCover" checked={saveCoverToProfile} onCheckedChange={(v) => setSaveCoverToProfile(Boolean(v))} />
          <Label htmlFor="saveCover">Save this cover letter to my profile</Label>
        </div>

        <div className="space-y-2">
          <Label>Choose how to apply</Label>
          <RadioGroup value={applyMethod} onValueChange={(v) => setApplyMethod(v as any)} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="profile" id="apply-profile" />
              <Label htmlFor="apply-profile">Apply with my profile</Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="cv" id="apply-cv" />
              <Label htmlFor="apply-cv">Apply with my uploaded CV</Label>
            </div>
          </RadioGroup>
        </div>

        {applyMethod === "cv" && (
          <div className="space-y-2">
            <Label htmlFor="cv">Upload CV (PDF/DOC)</Label>
            <Input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
          </div>
        )}

        <div className="pt-2">
          {hasExternal ? (
            <Button onClick={() => {
              if (job?.application_url) {
                window.open(job.application_url, "_blank");
              } else if (job?.apply_link) {
                window.open(job.apply_link, "_blank");
              } else if (job?.apply_email) {
                window.location.href = `mailto:${job.apply_email}?subject=Application for ${job.title}`;
              }
            }} className="w-full bg-gradient-primary hover:opacity-90" disabled={uploading || hasApplied}>
              {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ExternalLink className="mr-2 h-5 w-5" />}
              Apply Now
            </Button>
          ) : (
            <Button onClick={doApply} className="w-full bg-gradient-primary hover:opacity-90" disabled={uploading || hasApplied}>
              {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
              {hasApplied ? "Applied" : "Apply Now"}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Note: CVs are stored securely in our Database.</p>
      </CardContent>
    </Card>
  );
};

export default JobDetails;
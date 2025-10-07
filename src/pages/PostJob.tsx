import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PostJob = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role } = useUserRole();

  const [formData, setFormData] = useState({
    // Core fields
    title: "",
    company: "",
    description: "",
    company_id: "",
    
    // Google Job Posting Fields
    valid_through: "",
    employment_type: "FULL_TIME",
    job_location_type: "ON_SITE",
    job_location_country: "Kenya",
    job_location_county: "",
    job_location_city: "",
    job_location_address: "",
    applicant_location_requirements: "",
    direct_apply: true,
    application_url: "",
    
    // STEM/Health/Architecture Fields
    industry: "",
    specialization: "",
    required_qualifications: "",
    preferred_qualifications: "",
    education_requirements: "",
    license_requirements: "",
    practice_area: "",
    software_skills: "",
    project_type: "",
    experience_level: "Mid",
    language_requirements: "",
    visa_sponsorship: "Not Applicable",
    
    // Compensation & Schedule
    salary_currency: "KES",
    salary_min: "",
    salary_max: "",
    salary_period: "MONTH",
    work_schedule: "",
    
    // Application
    apply_link: "",
    apply_email: "",
    
    // Functional Portal Fields
    tags: "",
    job_function: "",
    status: "active",
  });

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to post jobs");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const { data: userCompany } = useQuery({
    queryKey: ["user-company", user?.id],
    queryFn: async () => {
      if (!user || role === "admin") return null;
      
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && role === "employer",
  });

  const { data: allCompanies } = useQuery({
    queryKey: ["all-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: role === "admin",
  });

  useEffect(() => {
    if (userCompany && role === "employer") {
      setFormData(prev => ({
        ...prev,
        company: userCompany.name,
        company_id: userCompany.id,
      }));
    }
  }, [userCompany, role]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      
      const jobData: any = {
        // Core fields
        title: data.title,
        company: data.company,
        description: data.description,
        user_id: user.id,
        company_id: data.company_id || null,
        posted_by: role === "admin" ? "admin" : "employer",
        status: data.status,
        
        // Google Job Posting Fields
        valid_through: data.valid_through || null,
        employment_type: data.employment_type,
        hiring_organization_name: data.company,
        job_location_type: data.job_location_type,
        job_location_country: data.job_location_country,
        job_location_county: data.job_location_county || null,
        job_location_city: data.job_location_city || null,
        job_location_address: data.job_location_address || null,
        location: `${data.job_location_city || ''}${data.job_location_county ? ', ' + data.job_location_county : ''}${data.job_location_country ? ', ' + data.job_location_country : ''}`.trim().replace(/^,\s*/, ''),
        applicant_location_requirements: data.applicant_location_requirements || null,
        direct_apply: data.direct_apply,
        application_url: data.application_url || null,
        
        // STEM/Health/Architecture Fields
        industry: data.industry || null,
        specialization: data.specialization || null,
        required_qualifications: data.required_qualifications ? data.required_qualifications.split(',').map((q: string) => q.trim()) : null,
        preferred_qualifications: data.preferred_qualifications ? data.preferred_qualifications.split(',').map((q: string) => q.trim()) : null,
        education_requirements: data.education_requirements || null,
        license_requirements: data.license_requirements || null,
        practice_area: data.practice_area || null,
        software_skills: data.software_skills ? data.software_skills.split(',').map((s: string) => s.trim()) : null,
        project_type: data.project_type || null,
        experience_level: data.experience_level || null,
        language_requirements: data.language_requirements || null,
        visa_sponsorship: data.visa_sponsorship,
        
        // Compensation & Schedule
        salary_currency: data.salary_currency,
        salary_min: data.salary_min ? parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? parseInt(data.salary_max) : null,
        salary_period: data.salary_period,
        salary: data.salary_min && data.salary_max ? 
          `${data.salary_currency} ${data.salary_min} - ${data.salary_max}/${data.salary_period.toLowerCase()}` : null,
        work_schedule: data.work_schedule || null,
        
        // Application
        apply_link: data.apply_link || null,
        apply_email: data.apply_email || null,
        
        // Functional Portal Fields
        tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : null,
        job_function: data.job_function || null,
      };

      const { error } = await supabase.from("jobs").insert([jobData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to post job. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (role === "employer" && !userCompany) {
      toast.error("Please create a company profile first from your dashboard");
      return;
    }
    
    if (!formData.direct_apply && !formData.application_url) {
      toast.error("Please provide an application URL when direct apply is disabled");
      return;
    }
    
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <Card className="border-border">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Post a New Job
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Fill in the details below to post a job opening
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {role === "employer" && !userCompany && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please create a company profile first from your dashboard before posting jobs.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="application">Application</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  {role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="company_id">Attach to Company (Optional)</Label>
                      <Select
                        value={formData.company_id}
                        onValueChange={(value) => {
                          const selectedCompany = allCompanies?.find(c => c.id === value);
                          setFormData({
                            ...formData,
                            company_id: value === "none" ? "" : value,
                            company: selectedCompany?.name || formData.company,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company or leave blank for direct listing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Company (Direct Listing)</SelectItem>
                          {allCompanies?.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      name="company"
                      value={userCompany?.name || formData.company}
                      onChange={handleChange}
                      placeholder="e.g., TechCorp Kenya"
                      required
                      disabled={role === "employer" && !!userCompany}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STEM">STEM</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Architecture">Architecture</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="e.g., Mechanical Engineering, Pediatrics"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the role, requirements, and responsibilities..."
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select value={formData.employment_type} onValueChange={(value) => setFormData({...formData, employment_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FULL_TIME">Full Time</SelectItem>
                          <SelectItem value="PART_TIME">Part Time</SelectItem>
                          <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                          <SelectItem value="INTERN">Intern</SelectItem>
                          <SelectItem value="TEMPORARY">Temporary</SelectItem>
                          <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_location_type">Work Location Type</Label>
                      <Select value={formData.job_location_type} onValueChange={(value) => setFormData({...formData, job_location_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ON_SITE">On Site</SelectItem>
                          <SelectItem value="REMOTE">Remote</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select value={formData.experience_level} onValueChange={(value) => setFormData({...formData, experience_level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry">Entry</SelectItem>
                          <SelectItem value="Mid">Mid</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Managerial">Managerial</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valid_through">Valid Through (Expiry Date)</Label>
                      <Input
                        id="valid_through"
                        name="valid_through"
                        type="date"
                        value={formData.valid_through}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_location_city">City</Label>
                      <Input
                        id="job_location_city"
                        name="job_location_city"
                        value={formData.job_location_city}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_location_county">County</Label>
                      <Input
                        id="job_location_county"
                        name="job_location_county"
                        value={formData.job_location_county}
                        onChange={handleChange}
                        placeholder="e.g., Nairobi County"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_location_country">Country</Label>
                      <Input
                        id="job_location_country"
                        name="job_location_country"
                        value={formData.job_location_country}
                        onChange={handleChange}
                        placeholder="e.g., Kenya"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_location_address">Full Address (Optional)</Label>
                    <Input
                      id="job_location_address"
                      name="job_location_address"
                      value={formData.job_location_address}
                      onChange={handleChange}
                      placeholder="Full street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Minimum Salary</Label>
                      <Input
                        id="salary_min"
                        name="salary_min"
                        type="number"
                        value={formData.salary_min}
                        onChange={handleChange}
                        placeholder="50000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Maximum Salary</Label>
                      <Input
                        id="salary_max"
                        name="salary_max"
                        type="number"
                        value={formData.salary_max}
                        onChange={handleChange}
                        placeholder="100000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_period">Salary Period</Label>
                      <Select value={formData.salary_period} onValueChange={(value) => setFormData({...formData, salary_period: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HOUR">Per Hour</SelectItem>
                          <SelectItem value="DAY">Per Day</SelectItem>
                          <SelectItem value="WEEK">Per Week</SelectItem>
                          <SelectItem value="MONTH">Per Month</SelectItem>
                          <SelectItem value="YEAR">Per Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="work_schedule">Work Schedule</Label>
                    <Input
                      id="work_schedule"
                      name="work_schedule"
                      value={formData.work_schedule}
                      onChange={handleChange}
                      placeholder="e.g., Monday-Friday 8:00-17:00"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="education_requirements">Education Requirements</Label>
                    <Input
                      id="education_requirements"
                      name="education_requirements"
                      value={formData.education_requirements}
                      onChange={handleChange}
                      placeholder="e.g., Bachelor's in Civil Engineering"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="required_qualifications">Required Qualifications (comma-separated)</Label>
                    <Textarea
                      id="required_qualifications"
                      name="required_qualifications"
                      value={formData.required_qualifications}
                      onChange={handleChange}
                      placeholder="e.g., 5+ years experience, Project management certification"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_qualifications">Preferred Qualifications (comma-separated)</Label>
                    <Textarea
                      id="preferred_qualifications"
                      name="preferred_qualifications"
                      value={formData.preferred_qualifications}
                      onChange={handleChange}
                      placeholder="e.g., Master's degree, Experience with specific tools"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license_requirements">License Requirements</Label>
                    <Input
                      id="license_requirements"
                      name="license_requirements"
                      value={formData.license_requirements}
                      onChange={handleChange}
                      placeholder="e.g., Registered Nurse License, PE License"
                    />
                  </div>

                  {formData.industry === "Health" && (
                    <div className="space-y-2">
                      <Label htmlFor="practice_area">Practice Area</Label>
                      <Input
                        id="practice_area"
                        name="practice_area"
                        value={formData.practice_area}
                        onChange={handleChange}
                        placeholder="e.g., Pediatrics, Surgery"
                      />
                    </div>
                  )}

                  {formData.industry === "Architecture" && (
                    <div className="space-y-2">
                      <Label htmlFor="project_type">Project Type</Label>
                      <Input
                        id="project_type"
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        placeholder="e.g., Residential, Commercial, Infrastructure"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="software_skills">Software/Technical Skills (comma-separated)</Label>
                    <Textarea
                      id="software_skills"
                      name="software_skills"
                      value={formData.software_skills}
                      onChange={handleChange}
                      placeholder="e.g., AutoCAD, MATLAB, Python, React"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language_requirements">Language Requirements</Label>
                      <Input
                        id="language_requirements"
                        name="language_requirements"
                        value={formData.language_requirements}
                        onChange={handleChange}
                        placeholder="e.g., English, Kiswahili"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="visa_sponsorship">Visa Sponsorship</Label>
                      <Select value={formData.visa_sponsorship} onValueChange={(value) => setFormData({...formData, visa_sponsorship: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_function">Job Function</Label>
                    <Input
                      id="job_function"
                      name="job_function"
                      value={formData.job_function}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineering, Nursing, Structural Design"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated keywords)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., engineering, remote, senior-level"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="application" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="direct_apply" 
                      checked={formData.direct_apply}
                      onCheckedChange={(checked) => setFormData({...formData, direct_apply: !!checked})}
                    />
                    <Label htmlFor="direct_apply" className="font-normal">
                      Enable direct application through this portal
                    </Label>
                  </div>

                  {!formData.direct_apply && (
                    <div className="space-y-2">
                      <Label htmlFor="application_url">External Application URL *</Label>
                      <Input
                        id="application_url"
                        name="application_url"
                        type="url"
                        value={formData.application_url}
                        onChange={handleChange}
                        placeholder="https://company.com/apply"
                        required={!formData.direct_apply}
                      />
                    </div>
                  )}

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Alternative Application Methods (Optional)</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apply_email">Apply via Email</Label>
                      <Input
                        id="apply_email"
                        name="apply_email"
                        type="email"
                        value={formData.apply_email}
                        onChange={handleChange}
                        placeholder="careers@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apply_link">Apply via External Link</Label>
                      <Input
                        id="apply_link"
                        name="apply_link"
                        type="url"
                        value={formData.apply_link}
                        onChange={handleChange}
                        placeholder="https://company.com/careers"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicant_location_requirements">Applicant Location Requirements</Label>
                    <Textarea
                      id="applicant_location_requirements"
                      name="applicant_location_requirements"
                      value={formData.applicant_location_requirements}
                      onChange={handleChange}
                      placeholder="e.g., Must be authorized to work in Kenya"
                      className="min-h-[80px]"
                    />
                  </div>

                  {role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Job Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={mutation.isPending || (role === "employer" && !userCompany)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting Job...
                  </>
                ) : (
                  "Post Job"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
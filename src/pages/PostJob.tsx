import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import RichTextEditor from "@/components/RichTextEditor";

const PostJob = () => {
  const { id: jobId } = useParams(); // Get job ID from URL params for editing
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
    required_qualifications: "",
    preferred_qualifications: "",
    education_level_id: "none", // Changed from empty string to "none"
    experience_level: "Mid",
    language_requirements: "",
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
    additional_info: "",
  });

  const [selectedCountyId, setSelectedCountyId] = useState<string>("");
  const [selectedTownId, setSelectedTownId] = useState<string>("");

  const { data: industries } = useQuery({
    queryKey: ["industries"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("industries")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return (data as { id: number; name: string }[]) || [];
    },
  });

  const { data: educationLevels } = useQuery({
    queryKey: ["education_levels"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("education_levels")
        .select("id, name")
        .order("id");
      if (error) throw error;
      return (data as { id: number; name: string }[]) || [];
    },
  });

  const { data: jobFunctions } = useQuery({
    queryKey: ["job_functions"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("job_functions")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return (data as { id: number; name: string }[]) || [];
    },
  });

  const { data: counties } = useQuery({
    queryKey: ["counties"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("counties")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return (data as { id: number; name: string }[]) || [];
    },
  });

  const { data: towns } = useQuery({
    queryKey: ["towns", selectedCountyId],
    queryFn: async () => {
      if (!selectedCountyId) return [] as { id: number; name: string; county_id: number }[];
      const { data, error } = await (supabase as any)
        .from("towns")
        .select("id, name, county_id")
        .eq("county_id", Number(selectedCountyId))
        .order("name");
      if (error) throw error;
      return (data as { id: number; name: string; county_id: number }[]) || [];
    },
    enabled: !!selectedCountyId,
  });

  // Keep form location fields in sync with selected county/town
  useEffect(() => {
    const countyName = counties?.find(c => String(c.id) === selectedCountyId)?.name || "";
    setFormData(prev => ({ ...prev, job_location_county: countyName }));
  }, [selectedCountyId, counties]);

  useEffect(() => {
    const townName = towns?.find(t => String(t.id) === selectedTownId)?.name || "";
    setFormData(prev => ({ ...prev, job_location_city: townName }));
  }, [selectedTownId, towns]);

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

  // Add query to fetch job data when editing
  const { data: existingJob, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });

  // Populate form with existing job data when loaded
  useEffect(() => {
    if (existingJob) {
      setFormData({
        // Core fields
        title: existingJob.title || "",
        company: existingJob.company || "",
        description: existingJob.description || "",
        company_id: existingJob.company_id || "",
        
        // Google Job Posting Fields
        valid_through: existingJob.valid_through || "",
        employment_type: existingJob.employment_type || "FULL_TIME",
        job_location_type: existingJob.job_location_type || "ON_SITE",
        job_location_country: existingJob.job_location_country || "Kenya",
        job_location_county: existingJob.job_location_county || "",
        job_location_city: existingJob.job_location_city || "",
        job_location_address: existingJob.job_location_address || "",
        applicant_location_requirements: existingJob.applicant_location_requirements?.toString() || "",
        direct_apply: existingJob.direct_apply ?? true,
        application_url: existingJob.application_url || "",
        
        // STEM/Health/Architecture Fields
        industry: existingJob.industry || "",
        required_qualifications: existingJob.required_qualifications?.toString() || "",
        preferred_qualifications: existingJob.preferred_qualifications?.toString() || "",
        education_level_id: (existingJob as any).education_level_id ? String((existingJob as any).education_level_id) : "none", // Updated to use "none" instead of empty string
        experience_level: existingJob.experience_level || "Mid",
        language_requirements: existingJob.language_requirements || "",
        
        // Compensation & Schedule
        salary_currency: existingJob.salary_currency || "KES",
        salary_min: existingJob.salary_min?.toString() || "",
        salary_max: existingJob.salary_max?.toString() || "",
        salary_period: existingJob.salary_period || "MONTH",
        work_schedule: existingJob.work_schedule || "",
        
        // Application
        apply_link: existingJob.apply_link || "",
        apply_email: existingJob.apply_email || "",
        
        // Functional Portal Fields
        tags: existingJob.tags?.toString() || "",
        job_function: existingJob.job_function || "",
        status: existingJob.status || "active",
        additional_info: existingJob.additional_info?.toString() || "",
      });
      
      // Set county and town IDs if available
      if (existingJob.job_location_county) {
        const county = counties?.find(c => c.name === existingJob.job_location_county);
        if (county) setSelectedCountyId(String(county.id));
      }
      
      if (existingJob.job_location_city) {
        const town = towns?.find(townItem => townItem.name === existingJob.job_location_city);
        if (town) setSelectedTownId(String(town.id));
      }
    }
  }, [existingJob, counties, towns]);

  // Update document title when editing
  const isEditing = !!jobId;
  useEffect(() => {
    if (isEditing) {
      document.title = `Edit Job - CareerSasa Kenya`;
    } else {
      document.title = `Post a New Job - CareerSasa Kenya`;
    }
    
    // Reset title on unmount
    return () => {
      document.title = "CareerSasa Kenya - Find Your Dream Job in Kenya";
    };
  }, [isEditing]);

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
        required_qualifications: data.required_qualifications || null,
        preferred_qualifications: data.preferred_qualifications || null,
        education_level_id: data.education_level_id && data.education_level_id !== "none" ? parseInt(data.education_level_id) : null, // Updated to handle "none" value
        experience_level: data.experience_level || null,
        language_requirements: data.language_requirements || null,

        // Compensation & Schedule
        salary_currency: data.salary_currency,
        salary_min: data.salary_min ? parseInt(data.salary_min) : null,
        salary_max: data.salary_max ? parseInt(data.salary_max) : null,
        salary_period: data.salary_period,
        salary: data.salary_min && data.salary_max ? `${data.salary_currency} ${data.salary_min} - ${data.salary_max}/${data.salary_period.toLowerCase()}` : null,
        work_schedule: data.work_schedule || null,

        // Application
        apply_link: data.apply_link || null,
        apply_email: data.apply_email || null,

        // Functional Portal Fields
        tags: data.tags || null,
        job_function: data.job_function || null,
        additional_info: data.additional_info || null,
      };

      console.log("Job data being saved:", jobData);

      if (jobId) {
        // Update existing job
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", jobId);
        if (error) throw error;
      } else {
        // Create new job
        const { error } = await supabase
          .from("jobs")
          .insert([jobData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(jobId ? "Job updated successfully!" : "Job posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(jobId ? "Failed to update job. Please try again." : "Failed to post job. Please try again.");
      console.error("Job operation error:", error);
      // Show more detailed error information
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      }
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
    
    if (!formData.direct_apply && !formData.application_url && !formData.apply_email && !formData.apply_link) {
      toast.error("Please provide at least one application method when direct apply is disabled");
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

  if (loading || (jobId && isJobLoading)) {
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
              {isEditing ? "Edit Job" : "Post a New Job"}
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              {isEditing ? "Update the job details below" : "Fill in the details below to post a job opening"}
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
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-muted rounded-lg mb-6 min-h-[40px]">
                  <TabsTrigger value="basic" className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">1/4. Basic</TabsTrigger>
                  <TabsTrigger value="details" className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">2/4. Further Details</TabsTrigger>
                  <TabsTrigger value="requirements" className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">3/4. Requirements</TabsTrigger>
                  <TabsTrigger value="application" className="w-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">4/4. Application Methods</TabsTrigger>
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
                          {industries?.map(ind => (
                            <SelectItem key={ind.id} value={ind.name}>{ind.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_function">Job Function</Label>
                      <Select value={formData.job_function} onValueChange={(value) => setFormData({...formData, job_function: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job function" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobFunctions?.map(func => (
                            <SelectItem key={func.id} value={func.name}>{func.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                      label="Job Description *"
                      placeholder="Describe the role, requirements, and responsibilities..."
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

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Compensation Details</p>
                    
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
                          placeholder="80000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salary_period">Period</Label>
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
                        placeholder="e.g., Monday–Friday 8:00–17:00"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">Location Details</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="county">County</Label>
                        <Select value={selectedCountyId} onValueChange={setSelectedCountyId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select county" />
                          </SelectTrigger>
                          <SelectContent>
                            {counties?.map(county => (
                              <SelectItem key={county.id} value={String(county.id)}>{county.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City/Town</Label>
                        <Select 
                          value={selectedTownId} 
                          onValueChange={setSelectedTownId}
                          disabled={!selectedCountyId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={selectedCountyId ? "Select town" : "Select county first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {towns?.map(town => (
                              <SelectItem key={town.id} value={String(town.id)}>{town.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_location_address">Full Address</Label>
                      <Input
                        id="job_location_address"
                        name="job_location_address"
                        value={formData.job_location_address}
                        onChange={handleChange}
                        placeholder="e.g., 123 Main Street, Building A"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="requirements" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <RichTextEditor
                      value={formData.required_qualifications}
                      onChange={(value) => setFormData({...formData, required_qualifications: value})}
                      label="Required Qualifications"
                      placeholder="Enter required qualifications, e.g., Bachelor's in Computer Science, 3+ years experience"
                    />
                    <p className="text-xs text-muted-foreground">Use the editor to format your qualifications</p>
                  </div>

                  <div className="space-y-2">
                    <RichTextEditor
                      value={formData.preferred_qualifications}
                      onChange={(value) => setFormData({...formData, preferred_qualifications: value})}
                      label="Preferred Qualifications"
                      placeholder="Enter preferred qualifications, e.g., Master's degree, Leadership experience"
                    />
                    <p className="text-xs text-muted-foreground">Use the editor to format your qualifications</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education_level_id">Education Level</Label>
                      <Select 
                        value={formData.education_level_id} 
                        onValueChange={(value) => setFormData({...formData, education_level_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select minimum education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific requirement</SelectItem>
                          {educationLevels?.map(level => (
                            <SelectItem key={level.id} value={String(level.id)}>{level.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                  </div>

                  {/* Practice Area (Health) and Project Type (Architecture) fields removed */}
                  {/* Visa Sponsorship field removed */}

                  {/* Applicant Location Requirements moved from application tab */}
                  <div className="space-y-2">
                    <RichTextEditor
                      value={formData.applicant_location_requirements}
                      onChange={(value) => setFormData({...formData, applicant_location_requirements: value})}
                      label="Applicant Location Requirements"
                      placeholder="e.g., Must be authorized to work in Kenya"
                    />
                  </div>

                  <div className="space-y-2">
                    <RichTextEditor
                      value={formData.additional_info}
                      onChange={(value) => setFormData({...formData, additional_info: value})}
                      label="Additional Information"
                      placeholder="Add any additional information about this job, such as career tips, FAQs, etc..."
                    />
                    <p className="text-xs text-muted-foreground">This will appear below the safety alert on the job details page</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (Keywords)</Label>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., engineering, remote, senior (comma-separated)"
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
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

                  {/* Applicant Location Requirements moved to requirements tab */}

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
                    {isEditing ? "Updating Job..." : "Posting Job..."}
                  </>
                ) : (
                  isEditing ? "Update Job" : "Post Job"
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
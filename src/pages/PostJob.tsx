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
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";

const PostJob = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { role } = useUserRole();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: "",
    apply_link: "",
    apply_email: "",
    company_id: "",
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
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        salary: data.salary || null,
        apply_link: data.apply_link || null,
        apply_email: data.apply_email || null,
        user_id: user.id,
        company_id: data.company_id || null,
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
    
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (role === "employer" && !userCompany) {
      toast.error("Please create a company profile first from your dashboard");
      return;
    }
    
    if (!formData.apply_link && !formData.apply_email) {
      toast.error("Please provide either an apply link or email");
      return;
    }
    
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Post a New Job
            </CardTitle>
            <CardDescription className="text-base">
              Fill in the details below to post a job opening
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {role === "employer" && !userCompany && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please create a company profile first from your dashboard before posting jobs.
                  </AlertDescription>
                </Alert>
              )}

              {role === "admin" && (
                <div className="space-y-2">
                  <Label htmlFor="company_id">Attach to Company (Optional)</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) => {
                      const selectedCompany = allCompanies?.find(c => c.id === value);
                      setFormData({
                        ...formData,
                        company_id: value,
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
                {role === "employer" && userCompany && (
                  <p className="text-xs text-muted-foreground">
                    Using your company profile: {userCompany.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Nairobi, Kenya"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary (Optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., KSh 150,000 - 200,000/month"
                />
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

              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium">Application Method (at least one required)</p>
                
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
                  <Label htmlFor="apply_link">Apply via Link</Label>
                  <Input
                    id="apply_link"
                    name="apply_link"
                    type="url"
                    value={formData.apply_link}
                    onChange={handleChange}
                    placeholder="https://company.com/apply"
                  />
                </div>
              </div>

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

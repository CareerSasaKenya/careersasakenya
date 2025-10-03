import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Briefcase, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import CompanyProfileForm from "@/components/CompanyProfileForm";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
}

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select("id, title, company, location, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load jobs");
      console.error(error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast.error("Failed to delete job");
    } else {
      toast.success("Job deleted successfully");
      fetchJobs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employer Dashboard</h1>
        <Link to="/post-job">
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                My Job Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground">No jobs posted yet. Create your first job posting!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link to={`/jobs/${job.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <CompanyProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerDashboard;

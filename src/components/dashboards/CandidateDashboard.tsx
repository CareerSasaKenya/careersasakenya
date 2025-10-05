import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  jobs: {
    title: string;
    company: string;
    location: string;
  };
}

interface SavedJob {
  id: string;
  job_id: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
}

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [appsResult, savedResult] = await Promise.all([
      supabase
        .from("job_applications")
        .select("id, job_id, status, created_at, jobs(title, company, location)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_jobs")
        .select("id, job_id, created_at, jobs(id, title, company, location)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (appsResult.error) {
      toast.error("Failed to load applications");
    } else {
      setApplications(appsResult.data || []);
    }

    if (savedResult.error) {
      toast.error("Failed to load saved jobs");
    } else {
      setSavedJobs(savedResult.data || []);
    }

    setLoading(false);
  };

  const handleUnsave = async (savedJobId: string) => {
    const { error } = await supabase.from("saved_jobs").delete().eq("id", savedJobId);

    if (error) {
      toast.error("Failed to unsave job");
    } else {
      toast.success("Job removed from saved");
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground">
              No applications yet. <Link to="/jobs" className="text-primary underline">Browse jobs</Link> to apply.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      <Link to={`/jobs/${app.job_id}`} className="hover:underline">
                        {app.jobs?.title || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{app.jobs?.company || "N/A"}</TableCell>
                    <TableCell>{app.jobs?.location || "N/A"}</TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : savedJobs.length === 0 ? (
            <p className="text-muted-foreground">
              No saved jobs yet. <Link to="/jobs" className="text-primary underline">Browse jobs</Link> and save your favorites.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Saved</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedJobs.map((saved) => (
                  <TableRow key={saved.id}>
                    <TableCell className="font-medium">
                      <Link to={`/jobs/${saved.jobs?.id}`} className="hover:underline">
                        {saved.jobs?.title || "N/A"}
                      </Link>
                    </TableCell>
                    <TableCell>{saved.jobs?.company || "N/A"}</TableCell>
                    <TableCell>{saved.jobs?.location || "N/A"}</TableCell>
                    <TableCell>{new Date(saved.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleUnsave(saved.id)}>
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
    </div>
  );
};

export default CandidateDashboard;

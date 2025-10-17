import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Briefcase, Users, Trash2, FileText, Edit, Eye } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  employment_type: string;
  status: string;
  industry: string;
  posted_by: string;
}

interface User {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
  author_id: string | null;
}

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [jobsResult, usersResult, blogPostsResult] = await Promise.all([
      supabase.from("jobs").select("id, title, company, location, created_at, employment_type, status, industry, posted_by").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("id, title, category, created_at, author_id").order("created_at", { ascending: false }),
    ]);

    if (jobsResult.error) {
      toast.error("Failed to load jobs");
    } else {
      setJobs(jobsResult.data || []);
    }

    if (usersResult.error) {
      toast.error("Failed to load users");
    } else {
      setUsers(usersResult.data || []);
    }

    if (blogPostsResult.error) {
      toast.error("Failed to load blog posts");
    } else {
      setBlogPosts(blogPostsResult.data || []);
    }

    setLoading(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      toast.error("Failed to delete job");
    } else {
      toast.success("Job deleted successfully");
      fetchData();
    }
  };

  const handleDeleteBlogPost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

    if (error) {
      toast.error("Failed to delete blog post");
    } else {
      toast.success("Blog post deleted successfully");
      fetchData();
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/blog/create">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              New Blog Post
            </Button>
          </Link>
          <Link to="/post-job">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">All Jobs</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="users">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                All Job Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground">No jobs available.</p>
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
                        <TableCell className="font-medium">
                          <Link to={`/jobs/${job.id}`} className="hover:underline">
                            {job.title}
                          </Link>
                        </TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/post-job/${job.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground">No users found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.user_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <span className="capitalize px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : blogPosts.length === 0 ? (
                <p className="text-muted-foreground">No blog posts available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Posted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          <Link to={`/blog/${generateSlug(post.title)}`} className="hover:underline">
                            {post.title}
                          </Link>
                        </TableCell>
                        <TableCell>{post.category || "Uncategorized"}</TableCell>
                        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/blog/${generateSlug(post.title)}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/blog/edit/${post.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBlogPost(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

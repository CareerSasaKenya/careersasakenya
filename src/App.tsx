import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import PostJob from "./pages/PostJob";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CreateBlogPost from "./pages/CreateBlogPost";
import CompanyProfile from "./pages/CompanyProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle page visibility changes
const VisibilityHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if we're still on a valid route
        const currentPath = location.pathname;
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          // If the root element is missing or empty, force navigation to current path
          const rootElement = document.getElementById('root');
          if (!rootElement || rootElement.children.length === 0) {
            console.log('Re-rendering route due to visibility change');
            navigate(currentPath, { replace: true });
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VisibilityHandler />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            {/* Redirect old UUID URLs to new slug URLs */}
            <Route path="/jobs/:slug" element={<JobDetails />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/post-job/:id" element={<PostJob />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/blog/create" element={<CreateBlogPost />} />
            <Route path="/blog/edit/:id" element={<CreateBlogPost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <nav className="border-b border-border/50 bg-card/80 sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="p-2 md:p-2.5 rounded-xl bg-gradient-primary shadow-glow transition-all duration-300 group-hover:shadow-xl group-hover:scale-110">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CareerSasa
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/jobs">
            <Button variant="ghost">Browse Jobs</Button>
          </Link>
          <Link to="/blog">
            <Button variant="ghost">Blog</Button>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
                className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button variant="gradient" size="lg" className="hidden lg:flex">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MobileNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
    setOpen(false);
  };

  const closeMenu = () => setOpen(false);

  if (!open) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/60" onClick={closeMenu} />
      <div className="fixed right-4 top-4 w-3/4 max-w-[300px] rounded-xl border border-border bg-background shadow-lg animate-in slide-in-from-right duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-primary shadow-glow">
                <Briefcase className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold bg-gradient-primary bg-clip-text text-transparent">
                CareerSasa
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMenu} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="/jobs" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-base">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/blog" onClick={closeMenu}>
              <Button variant="ghost" className="w-full justify-start text-base">
                Blog
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Dashboard
                  </Button>
                </Link>
                <div className="pt-3 mt-2 border-t">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-base hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 mt-2 border-t">
                <Link to="/auth" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full text-base mb-2">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth" onClick={closeMenu}>
                  <Button variant="gradient" className="w-full text-base">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
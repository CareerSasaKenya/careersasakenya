import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              CareerSasa
            </span>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <nav className="flex flex-col gap-1 p-4">
              <Link to="/jobs" onClick={closeSheet}>
                <Button variant="ghost" className="w-full justify-start text-base">
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/blog" onClick={closeSheet}>
                <Button variant="ghost" className="w-full justify-start text-base">
                  Blog
                </Button>
              </Link>

              {user && (
                <Link to="/dashboard" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start text-base">
                    Dashboard
                  </Button>
                </Link>
              )}
            </nav>

            <div className="mt-auto p-4 border-t">
              {user ? (
                <Button
                  variant="outline"
                  className="w-full justify-start text-base hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/auth" onClick={closeSheet}>
                    <Button variant="ghost" className="w-full text-base">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={closeSheet}>
                    <Button variant="gradient" className="w-full text-base">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
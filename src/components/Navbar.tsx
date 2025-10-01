import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CareerSasa
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/jobs">
            <Button variant="ghost">Browse Jobs</Button>
          </Link>
          <Link to="/post-job">
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Post a Job
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

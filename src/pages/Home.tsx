import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Find Your Dream Job in Kenya
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover exciting career opportunities across Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8">
                <Search className="mr-2 h-5 w-5" />
                Browse Jobs
              </Button>
            </Link>
            <Link to="/post-job">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-primary hover:bg-primary/10">
                <Briefcase className="mr-2 h-5 w-5" />
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="inline-block p-4 rounded-full bg-gradient-primary mb-4">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Latest Opportunities</h3>
              <p className="text-muted-foreground">
                Access fresh job postings from companies across Kenya
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="inline-block p-4 rounded-full bg-gradient-secondary mb-4">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Top Employers</h3>
              <p className="text-muted-foreground">
                Connect with leading companies hiring in Kenya
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="inline-block p-4 rounded-full bg-gradient-primary mb-4">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Career Growth</h3>
              <p className="text-muted-foreground">
                Find roles that match your skills and ambitions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

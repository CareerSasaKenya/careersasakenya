import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32 px-4">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Find Your Dream Job<br />in Kenya
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Connect with top employers and discover exciting career opportunities across the country
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/jobs">
                <Button variant="gradient" size="lg" className="text-lg px-10">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/post-job">
                <Button size="lg" variant="outline" className="text-lg px-10">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CareerSasa?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The premier job platform connecting talent with opportunity
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-primary mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Briefcase className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Latest Opportunities</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Access fresh job postings from companies across Kenya, updated daily with new positions
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up [animation-delay:150ms]">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-secondary mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Users className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Top Employers</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Connect with leading companies actively hiring talented professionals in Kenya
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up [animation-delay:300ms]">
              <div className="inline-flex p-5 rounded-2xl bg-gradient-primary mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Career Growth</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Find roles that perfectly match your skills, experience, and career ambitions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

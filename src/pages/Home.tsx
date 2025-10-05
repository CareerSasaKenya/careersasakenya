import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32 px-4">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight px-4">
              Find Your Dream Job<br className="hidden sm:block" />in Kenya
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 md:mb-10 max-w-3xl mx-auto px-4">
              Connect with top employers and discover exciting career opportunities across the country
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button variant="gradient" size="lg" className="text-base md:text-lg px-8 md:px-10 w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/post-job" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="text-base md:text-lg px-8 md:px-10 w-full sm:w-auto">
                  <Briefcase className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16 animate-slide-up px-4">
            <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-3 md:mb-4">Why Choose CareerSasa?</h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              The premier job platform connecting talent with opportunity
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group text-center p-6 md:p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up">
              <div className="inline-flex p-4 md:p-5 rounded-2xl bg-gradient-primary mb-4 md:mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Briefcase className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Latest Opportunities</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Access fresh job postings from companies across Kenya, updated daily with new positions
              </p>
            </div>
            
            <div className="group text-center p-6 md:p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up [animation-delay:150ms]">
              <div className="inline-flex p-4 md:p-5 rounded-2xl bg-gradient-secondary mb-4 md:mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-secondary-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Top Employers</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Connect with leading companies actively hiring talented professionals in Kenya
              </p>
            </div>
            
            <div className="group text-center p-6 md:p-8 rounded-2xl glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slide-up [animation-delay:300ms] sm:col-span-2 lg:col-span-1">
              <div className="inline-flex p-4 md:p-5 rounded-2xl bg-gradient-primary mb-4 md:mb-6 shadow-glow group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">Career Growth</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
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

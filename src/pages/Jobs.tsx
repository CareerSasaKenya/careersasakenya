import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { Loader2, ChevronLeft, ChevronRight, Search, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { Database } from "@/integrations/supabase/types";

interface SearchFilters {
  searchTerm: string;
  location: string;
  jobType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  remoteOnly: boolean;
  educationLevel: string;
  industry: string;
  sortBy: string;
}

// Static data for dropdowns
const JOB_FUNCTIONS = [
  { name: "Accounting, Auditing & Finance" },
  { name: "Admin & Office" },
  { name: "Agriculture, Food & Natural Resources" },
  { name: "Building & Architecture" },
  { name: "Community & Social Services" },
  { name: "Consulting & Strategy" },
  { name: "Creative & Design" },
  { name: "Customer Service & Support" },
  { name: "Driver & Transport Services" },
  { name: "Education & Training" },
  { name: "Engineering & Technology" },
  { name: "Environment, Energy & Natural Resources" },
  { name: "Estate Agents & Property Management" },
  { name: "Farming & Veterinary" },
  { name: "Food Services & Catering" },
  { name: "Health & Safety" },
  { name: "Healthcare & Medical" },
  { name: "Hospitality & Leisure" },
  { name: "Human Resources & Recruitment" },
  { name: "IT & Software" },
  { name: "Legal Services" },
  { name: "Management & Business Development" },
  { name: "Manufacturing & Warehousing" },
  { name: "Marketing & Communications" },
  { name: "Product & Project Management" },
  { name: "Quality Control & Assurance" },
  { name: "Research, Teaching & Training" },
  { name: "Sales" },
  { name: "Security" },
  { name: "Supply Chain & Procurement" },
  { name: "Trades & Services" },
  { name: "Travel, Tourism & Leisure" },
  { name: "Volunteer & NGO Work" },
  { name: "Government & Public Service" },
  { name: "Banking, Insurance & Financial Services" },
  { name: "Media, Advertising & PR" },
  { name: "Science & Laboratory" },
  { name: "Telecommunications" },
  { name: "Sports, Fitness & Recreation" },
  { name: "NGO, NPO & Charity" },
  { name: "Beauty, Wellness & Fitness" },
  { name: "Real Estate & Construction" },
  { name: "Logistics & Transportation" },
  { name: "Retail, Fashion & FMCG" },
  { name: "Maintenance, Repair & Installation" },
  { name: "Data, Analytics & AI" },
  { name: "Other / Miscellaneous" }
];

const INDUSTRIES = [
  { name: "Accounting, Auditing & Finance" },
  { name: "Advertising, Media & Communications" },
  { name: "Agriculture, Fishing & Forestry" },
  { name: "Automotive & Aviation" },
  { name: "Banking, Insurance & Financial Services" },
  { name: "Building, Construction & Real Estate" },
  { name: "Charity, NGO & Non-Profit" },
  { name: "Community & Social Services" },
  { name: "Consulting & Professional Services" },
  { name: "Creative Arts, Entertainment & Design" },
  { name: "Education & Training" },
  { name: "Energy, Utilities & Waste Management" },
  { name: "Engineering & Technical Services" },
  { name: "Environment & Natural Resources" },
  { name: "Fashion & Beauty" },
  { name: "Food Services, Hospitality & Catering" },
  { name: "Government & Public Administration" },
  { name: "Healthcare, Medical & Pharmaceutical" },
  { name: "Human Resources & Recruitment" },
  { name: "ICT & Telecommunications" },
  { name: "Import & Export" },
  { name: "Legal Services" },
  { name: "Logistics & Transportation" },
  { name: "Manufacturing & Warehousing" },
  { name: "Marketing & Public Relations" },
  { name: "Mining, Oil & Gas" },
  { name: "NGO, NPO & Charity" },
  { name: "Printing, Publishing & Packaging" },
  { name: "Real Estate & Property Management" },
  { name: "Research, Science & Technology" },
  { name: "Retail, Wholesale, E-commerce & FMCG" },
  { name: "Security & Defence" },
  { name: "Sports, Fitness & Recreation" },
  { name: "Tourism, Travel & Leisure" },
  { name: "Agriculture & Agribusiness" },
  { name: "Financial Technology (FinTech)" },
  { name: "Media, Film & Broadcasting" },
  { name: "Maritime & Shipping" },
  { name: "Education Technology (EdTech)" },
  { name: "Arts, Culture & Heritage" },
  { name: "Renewable Energy & Climate" },
  { name: "Chemical & Process Industry" },
  { name: "Transport & Infrastructure" },
  { name: "Business Process Outsourcing (BPO)" },
  { name: "Health Tech & Biotechnology" },
  { name: "Non-classified / Miscellaneous" }
];

const COUNTIES = [
  { name: "Baringo" }, { name: "Bomet" }, { name: "Bungoma" }, { name: "Busia" },
  { name: "Elgeyo-Marakwet" }, { name: "Embu" }, { name: "Garissa" }, { name: "Homa Bay" },
  { name: "Isiolo" }, { name: "Kajiado" }, { name: "Kakamega" }, { name: "Kericho" },
  { name: "Kiambu" }, { name: "Kilifi" }, { name: "Kirinyaga" }, { name: "Kisii" },
  { name: "Kisumu" }, { name: "Kitui" }, { name: "Kwale" }, { name: "Laikipia" },
  { name: "Lamu" }, { name: "Machakos" }, { name: "Makueni" }, { name: "Mandera" },
  { name: "Marsabit" }, { name: "Meru" }, { name: "Migori" }, { name: "Mombasa" },
  { name: "Murang'a" }, { name: "Nairobi" }, { name: "Nakuru" }, { name: "Nandi" },
  { name: "Narok" }, { name: "Nyamira" }, { name: "Nyandarua" }, { name: "Nyeri" },
  { name: "Samburu" }, { name: "Siaya" }, { name: "Taita–Taveta" }, { name: "Tana River" },
  { name: "Tharaka–Nithi" }, { name: "Trans Nzoia" }, { name: "Turkana" }, { name: "Uasin Gishu" },
  { name: "Vihiga" }, { name: "Wajir" }, { name: "West Pokot" }
];

const JOBS_PER_PAGE = 12;

const Jobs = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    location: "",
    jobType: "",
    employmentType: "",
    experienceLevel: "",
    salaryMin: null,
    salaryMax: null,
    remoteOnly: false,
    educationLevel: "",
    industry: "",
    sortBy: "newest"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ["jobs", filters, currentPage],
    queryFn: async () => {
      // First, get the total count
      let countQuery = supabase
        .from("jobs")
        .select("*", { count: "exact", head: true });

      // Apply search filters for count
      if (filters.searchTerm) {
        countQuery = countQuery.ilike("title", `%${filters.searchTerm}%`);
      }

      if (filters.location) {
        countQuery = countQuery.eq("job_location_county", filters.location);
      }

      if (filters.employmentType) {
        countQuery = countQuery.eq("employment_type", filters.employmentType as Database["public"]["Enums"]["employment_type"]);
      }

      if (filters.experienceLevel) {
        countQuery = countQuery.eq("experience_level", filters.experienceLevel as Database["public"]["Enums"]["experience_level"]);
      }

      if (filters.remoteOnly) {
        countQuery = countQuery.eq("job_location_type", "REMOTE");
      }

      if (filters.educationLevel) {
        countQuery = countQuery.eq("education_levels.name", filters.educationLevel);
      }

      if (filters.industry) {
        countQuery = countQuery.eq("industry", filters.industry);
      }

      if (filters.jobType) {
        countQuery = countQuery.eq("job_function", filters.jobType);
      }

      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalJobs(count || 0);

      // Then get the paginated data
      let query = supabase
        .from("jobs")
        .select(`
          *,
          companies (
            id,
            name,
            logo
          ),
          education_levels (
            name
          )
        `)
        .range((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE - 1);

      // Apply search filters
      if (filters.searchTerm) {
        query = query.ilike("title", `%${filters.searchTerm}%`);
      }

      if (filters.location) {
        query = query.eq("job_location_county", filters.location);
      }

      if (filters.employmentType) {
        query = query.eq("employment_type", filters.employmentType as Database["public"]["Enums"]["employment_type"]);
      }

      if (filters.experienceLevel) {
        query = query.eq("experience_level", filters.experienceLevel as Database["public"]["Enums"]["experience_level"]);
      }

      if (filters.remoteOnly) {
        query = query.eq("job_location_type", "REMOTE");
      }

      if (filters.educationLevel) {
        query = query.eq("education_levels.name", filters.educationLevel);
      }

      if (filters.industry) {
        query = query.eq("industry", filters.industry);
      }

      if (filters.jobType) {
        query = query.eq("job_function", filters.jobType);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "salary_high":
          query = query.order("salary_max", { ascending: false });
          break;
        case "salary_low":
          query = query.order("salary_min", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of job listings when page changes
      const jobListingsElement = document.getElementById('job-listings');
      if (jobListingsElement) {
        jobListingsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearch = () => {
    // Reset to first page when search is triggered
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      jobType: "",
      employmentType: "",
      experienceLevel: "",
      salaryMin: null,
      salaryMax: null,
      remoteOnly: false,
      educationLevel: "",
      industry: "",
      sortBy: "newest"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 md:mb-12 text-center animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 bg-gradient-primary bg-clip-text text-transparent px-4">
            Browse Jobs
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto px-4">
            Discover your next career opportunity from top companies in Kenya
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <div className="flex-grow">
            {/* Search Boxes */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Keyword Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Keywords"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="w-full p-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                
                {/* Function Search with Dropdown - Truly Compact */}
                <div className="relative">
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                    className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                  >
                    <option value="">Any Function</option>
                    {JOB_FUNCTIONS.map((func, index) => (
                      <option key={index} value={func.name}>
                        {func.name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Industry Search with Dropdown - Truly Compact */}
                <div className="relative">
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                  >
                    <option value="">Any Industry</option>
                    {INDUSTRIES.map((ind, index) => (
                      <option key={index} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Location Search with Counties Dropdown - Truly Compact */}
                <div className="relative">
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full p-2 pl-6 pr-4 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary appearance-none truncate"
                  >
                    <option value="">Any Location</option>
                    {COUNTIES.map((county, index) => (
                      <option key={index} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="flex items-center">
                  <button
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-1 w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Job Listings */}
            <div id="job-listings">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading opportunities...</p>
                </div>
              ) : jobs && jobs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 md:gap-8">
                    {jobs.map((job, index) => (
                      <div key={job.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                        <JobCard
                          id={job.id}
                          title={job.title}
                          company={job.companies?.name || job.company}
                          location={job.location}
                          description={job.description}
                          salary={job.salary || undefined}
                          companyId={job.company_id}
                          companyLogo={job.companies?.logo}
                          industry={job.industry}
                          locationType={job.job_location_type}
                          employmentType={job.employment_type}
                          salaryMin={job.salary_min}
                          salaryMax={job.salary_max}
                          salaryCurrency={job.salary_currency}
                          salaryPeriod={job.salary_period}
                          experienceLevel={job.experience_level}
                          datePosted={job.date_posted}
                          validThrough={job.valid_through}
                          applicationUrl={job.application_url}
                          applyEmail={job.apply_email}
                          applyLink={job.apply_link}
                          skillsTop3={
                            Array.isArray(job.software_skills)
                              ? (job.software_skills as unknown[])
                                  .filter((s): s is string => typeof s === "string")
                                  .slice(0, 3)
                              : undefined
                          }
                          department={job.job_function}
                          jobSlug={job.job_slug}
                          educationLevel={(job as any).education_levels?.name}
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-8 space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Showing {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, totalJobs)} - {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs} jobs
                  </div>
                </>
              ) : (
                <div className="text-center py-32 animate-fade-in">
                  <div className="inline-flex p-6 rounded-full bg-muted mb-6">
                    <Loader2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-semibold mb-2">No jobs found</p>
                  <p className="text-muted-foreground text-lg">Try adjusting your search filters</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar Filters - With Reset Button at Bottom */}
          <div className="w-full lg:w-72 flex-shrink-0 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm border p-3 sticky top-6 h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-semibold">Filters</h3>
                <button 
                  onClick={resetFilters}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Sort By */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Sort By</label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="salary_high">Salary: High to Low</option>
                    <option value="salary_low">Salary: Low to High</option>
                  </select>
                </div>
                
                {/* Employment Type */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Employment Type</label>
                  <select 
                    value={filters.employmentType}
                    onChange={(e) => setFilters({...filters, employmentType: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="INTERN">Intern</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="VOLUNTEER">Volunteer</option>
                    <option value="PER_DIEM">Per Diem</option>
                  </select>
                </div>
                
                {/* Experience Level */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Experience Level</label>
                  <select 
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                {/* Education Level */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Education Level</label>
                  <input
                    type="text"
                    placeholder="e.g., Bachelor's, Master's"
                    value={filters.educationLevel}
                    onChange={(e) => setFilters({...filters, educationLevel: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                {/* Industry */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Industry</label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters({...filters, industry: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Industry</option>
                    {INDUSTRIES.map((ind, index) => (
                      <option key={index} value={ind.name}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Any Location</option>
                    {COUNTIES.map((county, index) => (
                      <option key={index} value={county.name}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Remote Only */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote-only"
                    checked={filters.remoteOnly}
                    onChange={(e) => setFilters({...filters, remoteOnly: e.target.checked})}
                    className="h-3 w-3 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remote-only" className="text-xs">Remote Only</label>
                </div>
                
                {/* Salary Range */}
                <div>
                  <label className="text-xs font-medium mb-1 block">Salary Range (KES)</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salaryMin || ''}
                      onChange={(e) => setFilters({...filters, salaryMin: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <span className="text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salaryMax || ''}
                      onChange={(e) => setFilters({...filters, salaryMax: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full p-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Filter Button at Bottom */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
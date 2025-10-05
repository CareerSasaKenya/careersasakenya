import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, DollarSign, FileText } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  companyId?: string | null;
  companyLogo?: string | null;
}

const JobCard = ({ id, title, company, location, description, salary, companyId, companyLogo }: JobCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 hover:scale-[1.02] overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-card-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
        <div className="flex flex-col gap-2.5 text-sm text-muted-foreground mt-3">
          {companyId ? (
            <Link to={`/companies/${companyId}`} className="flex items-center gap-2 hover:text-primary transition-colors group/company">
              {companyLogo && (
                <div className="h-6 w-6 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                  <img src={companyLogo} alt={company} className="h-5 w-5 object-contain" />
                </div>
              )}
              <Building2 className="h-4 w-4 text-primary group-hover/company:scale-110 transition-transform" />
              <span className="font-medium">{company}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Direct Listing</span>
              <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span>{location}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <span className="font-semibold text-foreground">{salary}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground line-clamp-3 mb-5 leading-relaxed">
          {description}
        </p>
        <Link to={`/jobs/${id}`}>
          <Button variant="gradient" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default JobCard;

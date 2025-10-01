import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, DollarSign } from "lucide-react";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
}

const JobCard = ({ id, title, company, location, description, salary }: JobCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border hover:border-primary/50">
      <CardHeader>
        <CardTitle className="text-xl text-card-foreground">{title}</CardTitle>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span>{company}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{location}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-secondary" />
              <span className="font-medium text-foreground">{salary}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {description}
        </p>
        <Link to={`/jobs/${id}`}>
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default JobCard;

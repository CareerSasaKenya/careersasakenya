import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  size: string | null;
  description: string | null;
}

interface Industry {
  id: number;
  name: string;
}

interface County {
  id: number;
  name: string;
}

interface Town {
  id: number;
  name: string;
  county_id: number;
}

const CompanyProfileForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: "",
    industry: "",
    location: "",
    size: "",
    description: "",
  });
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [counties, setCounties] = useState<County[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [selectedCountyId, setSelectedCountyId] = useState<string>("");
  const [selectedTownId, setSelectedTownId] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchCompany();
    }
  }, [user]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCompany(data);
        setFormData({
          name: data.name,
          logo: data.logo || "",
          website: data.website || "",
          industry: data.industry || "",
          location: data.location || "",
          size: data.size || "",
          description: data.description || "",
        });
        // Attempt to infer county/town from existing free-text location: "Town, County"
        if (data.location) {
          const parts = data.location.split(",").map((p: string) => p.trim());
          const inferredTown = parts.length > 1 ? parts[0] : "";
          const inferredCounty = parts.length > 1 ? parts[1] : parts[0];
          // We'll set after counties/towns load
          setTimeout(() => {
            const county = counties.find(c => c.name.toLowerCase() === (inferredCounty || "").toLowerCase());
            if (county) {
              setSelectedCountyId(String(county.id));
              // towns will be loaded by effect; try set town after a short delay
              setTimeout(() => {
                const townMatch = towns.find(t => t.name.toLowerCase() === (inferredTown || "").toLowerCase() && String(t.county_id) === String(county.id));
                if (townMatch) setSelectedTownId(String(townMatch.id));
              }, 300);
            }
          }, 300);
        }
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load lookup lists
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [industriesRes, countiesRes] = await Promise.all([
          (supabase as any).from("industries").select("id, name").order("name"),
          (supabase as any).from("counties").select("id, name").order("name"),
        ]);
        if (industriesRes.error) throw industriesRes.error;
        if (countiesRes.error) throw countiesRes.error;
        setIndustries((industriesRes.data as any) || []);
        setCounties((countiesRes.data as any) || []);
      } catch (err) {
        console.error("Failed to load lookup tables", err);
      }
    };
    loadLookups();
  }, []);

  // Load towns when county changes
  useEffect(() => {
    const loadTowns = async () => {
      if (!selectedCountyId) {
        setTowns([]);
        setSelectedTownId("");
        return;
      }
      const { data, error } = await (supabase as any)
        .from("towns")
        .select("id, name, county_id")
        .eq("county_id", Number(selectedCountyId))
        .order("name");
      if (error) {
        console.error("Failed to load towns", error);
        setTowns([]);
        return;
      }
      setTowns((data as any) || []);
    };
    loadTowns();
  }, [selectedCountyId]);

  // Keep formData.location in sync with selected county/town
  useEffect(() => {
    const countyName = counties.find(c => String(c.id) === selectedCountyId)?.name || "";
    const townName = towns.find(t => String(t.id) === selectedTownId)?.name || "";
    const loc = townName && countyName ? `${townName}, ${countyName}` : countyName || townName || "";
    setFormData(prev => ({ ...prev, location: loc }));
  }, [selectedCountyId, selectedTownId, counties, towns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (company) {
        // Update existing company
        const { error } = await supabase
          .from("companies")
          .update({
            name: formData.name,
            logo: formData.logo || null,
            website: formData.website || null,
            industry: formData.industry || null,
            location: formData.location || null,
            size: formData.size || null,
            description: formData.description || null,
          })
          .eq("id", company.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company profile updated successfully",
        });
      } else {
        // Create new company
        const { error } = await supabase.from("companies").insert({
          user_id: user?.id,
          name: formData.name,
          logo: formData.logo || null,
          website: formData.website || null,
          industry: formData.industry || null,
          location: formData.location || null,
          size: formData.size || null,
          description: formData.description || null,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Company profile created successfully",
        });

        fetchCompany();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {company ? "Edit Company Profile" : "Create Company Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://company.com"
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind.id} value={ind.name}>
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="county">County</Label>
              <Select
                value={selectedCountyId}
                onValueChange={(value) => {
                  setSelectedCountyId(value);
                  setSelectedTownId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {counties.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="town">Town</Label>
              <Select
                value={selectedTownId}
                onValueChange={(value) => setSelectedTownId(value)}
                disabled={!selectedCountyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCountyId ? "Select town" : "Select county first"} />
                </SelectTrigger>
                <SelectContent>
                  {towns.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="location">Location (auto-filled)</Label>
              <Input id="location" value={formData.location} readOnly placeholder="Select county and town" />
            </div>
          </div>

          <div>
            <Label htmlFor="size">Company Size</Label>
            <Input
              id="size"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell us about your company..."
              rows={5}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {company ? "Update Profile" : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyProfileForm;

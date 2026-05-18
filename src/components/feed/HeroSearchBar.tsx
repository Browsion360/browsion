import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISTRICTS } from "@/lib/format";

export function HeroSearchBar({
  ageMin, ageMax, district, religion, onChange, onSearch,
  countries, locationLabel = "District",
}: {
  ageMin: number; ageMax: number; district: string; religion: string;
  onChange: (k: "ageMin"|"ageMax"|"district"|"religion", v: string|number) => void;
  onSearch: () => void;
  countries?: string[];
  locationLabel?: string;
}) {
  const list = countries ?? DISTRICTS;
  return (
    <div className="rounded-3xl border border-border bg-card/90 p-3 shadow-soft backdrop-blur-md md:p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
        <Select value={String(ageMin)} onValueChange={(v) => onChange("ageMin", Number(v))}>
          <SelectTrigger><SelectValue placeholder="Min age" /></SelectTrigger>
          <SelectContent>
            {[18,21,24,27,30,33,36].map(n => <SelectItem key={n} value={String(n)}>Min {n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(ageMax)} onValueChange={(v) => onChange("ageMax", Number(v))}>
          <SelectTrigger><SelectValue placeholder="Max age" /></SelectTrigger>
          <SelectContent>
            {[24,27,30,33,36,40,45,55].map(n => <SelectItem key={n} value={String(n)}>Max {n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={district} onValueChange={(v) => onChange("district", v)}>
          <SelectTrigger><SelectValue placeholder={locationLabel} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any {locationLabel.toLowerCase()}</SelectItem>
            {list.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={religion} onValueChange={(v) => onChange("religion", v)}>
          <SelectTrigger><SelectValue placeholder="Religion" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any religion</SelectItem>
            {["Islam","Hindu","Christian","Buddhist"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={onSearch} className="gradient-rose text-primary-foreground">
          <Search className="mr-1 h-4 w-4" /> Search
        </Button>
      </div>
    </div>
  );
}

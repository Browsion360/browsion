import { SlidersHorizontal, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { HeroSearchBar } from "./HeroSearchBar";

export type FilterState = { ageMin: number; ageMax: number; district: string; religion: string };

export function CompactFilterBar({
  filters, applied, liveCount, onChange, onSearch, countries, locationLabel,
}: {
  filters: FilterState;
  applied: FilterState;
  liveCount: number;
  onChange: (k: keyof FilterState, v: string | number) => void;
  onSearch: () => void;
  countries?: string[];
  locationLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const districtLabel = applied.district === "any" ? `Any ${(locationLabel ?? "District").toLowerCase()}` : applied.district;
  const religionLabel = applied.religion === "any" ? "" : ` · ${applied.religion}`;

  return (
    <>
      {/* Mobile: pill trigger */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2.5 text-left text-sm shadow-soft backdrop-blur-md">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span className="truncate">
                <span className="font-semibold">{applied.ageMin}–{applied.ageMax}</span>
                <span className="text-muted-foreground"> · {districtLabel}{religionLabel}</span>
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Filter profiles</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <HeroSearchBar
                ageMin={filters.ageMin}
                ageMax={filters.ageMax}
                district={filters.district}
                religion={filters.religion}
                onChange={onChange}
                onSearch={() => { onSearch(); setOpen(false); }}
                countries={countries}
                locationLabel={locationLabel}
              />
            </div>
          </SheetContent>
        </Sheet>
        <span className="shrink-0 text-xs text-muted-foreground">{liveCount} live</span>
      </div>

      {/* Desktop: inline bar */}
      <div className="hidden md:block">
        <HeroSearchBar
          ageMin={filters.ageMin}
          ageMax={filters.ageMax}
          district={filters.district}
          religion={filters.religion}
          onChange={onChange}
          onSearch={onSearch}
          countries={countries}
          locationLabel={locationLabel}
        />
      </div>
    </>
  );
}

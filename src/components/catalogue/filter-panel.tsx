"use client";

import { categories, brands, availabilityLabels, type ProductAvailability } from "@/lib/catalogue";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";

export interface CatalogueFilters {
  categories: string[];
  brands: string[];
  availability: ProductAvailability[];
  priceRange: [number, number];
}

export interface FilterPanelProps {
  filters: CatalogueFilters;
  onChange: (patch: Partial<CatalogueFilters>) => void;
  onClear: () => void;
  showCategoryFilter?: boolean;
  brandOptions?: typeof brands;
  priceBounds: [number, number];
  hasActiveFilters: boolean;
}

const availabilityOptions: ProductAvailability[] = [
  "available",
  "reserved",
  "coming_soon",
  "maintenance",
  "unavailable",
];

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterPanel({
  filters,
  onChange,
  onClear,
  showCategoryFilter = true,
  brandOptions = brands,
  priceBounds,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-label">Filters</p>
        {hasActiveFilters ? (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onClear}>
            Clear all
          </Button>
        ) : null}
      </div>

      {showCategoryFilter ? (
        <>
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">Category</p>
            {categories.map((category) => (
              <label
                key={category.slug}
                className="flex items-center gap-2.5 text-sm text-foreground/80"
              >
                <Checkbox
                  checked={filters.categories.includes(category.slug)}
                  onCheckedChange={() =>
                    onChange({ categories: toggleValue(filters.categories, category.slug) })
                  }
                />
                {category.name}
              </label>
            ))}
          </div>
          <Divider />
        </>
      ) : null}

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Brand</p>
        {brandOptions.map((brand) => (
          <label key={brand.slug} className="flex items-center gap-2.5 text-sm text-foreground/80">
            <Checkbox
              checked={filters.brands.includes(brand.slug)}
              onCheckedChange={() => onChange({ brands: toggleValue(filters.brands, brand.slug) })}
            />
            {brand.name}
          </label>
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Availability</p>
        {availabilityOptions.map((status) => (
          <label key={status} className="flex items-center gap-2.5 text-sm text-foreground/80">
            <Checkbox
              checked={filters.availability.includes(status)}
              onCheckedChange={() =>
                onChange({ availability: toggleValue(filters.availability, status) })
              }
            />
            {availabilityLabels[status]}
          </label>
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Daily rate</p>
          <p className="text-small">
            ${filters.priceRange[0]} – ${filters.priceRange[1]}
          </p>
        </div>
        <Slider
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={5}
          value={filters.priceRange}
          onValueChange={(value) => onChange({ priceRange: value as [number, number] })}
        />
      </div>
    </div>
  );
}

export { FilterPanel, availabilityOptions };

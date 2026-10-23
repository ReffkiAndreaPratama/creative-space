import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SortOption } from "@/types/database";

interface FilterBarProps {
  categories: readonly string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  className?: string;
}

export function FilterBar({
  categories,
  selectedCategory,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Search */}
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="flex gap-3">
        {/* Category filter */}
        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="w-auto"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort by"
            className="w-auto pl-9"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A–Z</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

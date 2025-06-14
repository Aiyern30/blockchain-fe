// context/FilterContext.tsx
"use client";
import { createContext, useContext, useState } from "react";
import type { GridView } from "@/type/view";

export type FilterState = {
  category: string;
  sort: string;
  view: GridView;
  searchQuery: string;
};

const defaultFilter: FilterState = {
  category: "All",
  sort: "Newest",
  view: "medium",
  searchQuery: "",
};

const FilterContext = createContext<{
  filter: FilterState;
  setFilter: (newFilter: Partial<FilterState>) => void;
}>({
  filter: defaultFilter,
  setFilter: () => {},
});

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filter, setFilterState] = useState<FilterState>(defaultFilter);

  const setFilter = (newFilter: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  };

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);

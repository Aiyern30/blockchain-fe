"use client";

import { useEffect } from "react";
import { FaListUl } from "react-icons/fa";
import { TfiLayoutGrid4 } from "react-icons/tfi";
import { BsGrid3X3 } from "react-icons/bs";
import { SlGrid } from "react-icons/sl";
import { Button } from "@/components/ui";
import { useFilter } from "@/contexts/filter-context";
import { GridView } from "@/type/view";

interface ViewSelectorProps {
  className?: string;
}

export function ViewSelector({ className }: ViewSelectorProps) {
  const { filter, setFilter } = useFilter();
  const selectedView = filter.view;

  useEffect(() => {
    const storedView = localStorage.getItem("nft-grid-view") as GridView;
    if (storedView) {
      setFilter({ view: storedView });
    }
  }, [setFilter]);

  const handleViewChange = (newView: GridView) => {
    localStorage.setItem("nft-grid-view", newView);
    setFilter({ view: newView });
  };

  return (
    <div className={`flex space-x-2 ${className || ""}`}>
      <Button
        onClick={() => handleViewChange("list")}
        className={`rounded-md border px-4 py-2 ${
          selectedView === "list"
            ? "bg-[#7b3fe4] text-white hover:bg-purple-900 dark:bg-blue-900 dark:hover:bg-blue-700"
            : "hover:bg-purple-800 dark:hover:bg-blue-800 hover:text-white"
        }`}
        size="icon"
      >
        <FaListUl className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleViewChange("small")}
        className={`rounded-md border px-4 py-2 ${
          selectedView === "small"
            ? "bg-[#7b3fe4] text-white hover:bg-purple-900 dark:bg-blue-900 dark:hover:bg-blue-700"
            : "hover:bg-purple-800 dark:hover:bg-blue-800 hover:text-white"
        }`}
        size="icon"
      >
        <TfiLayoutGrid4 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleViewChange("medium")}
        className={`rounded-md border px-4 py-2 ${
          selectedView === "medium"
            ? "bg-[#7b3fe4] text-white hover:bg-purple-900 dark:bg-blue-900 dark:hover:bg-blue-700"
            : "hover:bg-purple-800 dark:hover:bg-blue-800 hover:text-white"
        }`}
        size="icon"
      >
        <BsGrid3X3 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleViewChange("large")}
        className={`rounded-md border px-4 py-2 ${
          selectedView === "large"
            ? "bg-[#7b3fe4] text-white hover:bg-purple-900 dark:bg-blue-900 dark:hover:bg-blue-700"
            : "hover:bg-purple-800 dark:hover:bg-blue-800 hover:text-white"
        }`}
        size="icon"
      >
        <SlGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Search,
  Share2,
  MoreHorizontal,
  List,
  Grid,
  GridIcon,
  LayoutGrid,
} from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@/components/ui/";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("collected");
  const [viewMode, setViewMode] = useState<
    "list" | "grid" | "large" | "compact"
  >("grid");

  const tabs = [
    { id: "collected", label: "Collected" },
    { id: "offers", label: "Offers made" },
    { id: "deals", label: "Deals" },
    { id: "created", label: "Created" },
    { id: "favorited", label: "Favorited" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Profile Header */}
      <div className="px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Unnamed</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code>0x2360...3D6A</code>
                <span>·</span>
                <span>Joined February 2025</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 border-b">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 text-sm font-medium transition-colors hover:text-primary
                  ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
              >
                {tab.label}
              </button>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Hidden</DropdownMenuItem>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All</DropdownMenuItem>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Inactive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Chains
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Ethereum</DropdownMenuItem>
                <DropdownMenuItem>Polygon</DropdownMenuItem>
                <DropdownMenuItem>Optimism</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name" className="pl-8 w-[300px]" />
            </div>
          </div>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "large" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none"
              onClick={() => setViewMode("large")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none border-l"
              onClick={() => setViewMode("compact")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-12 text-center">
          <p className="text-lg font-medium">No items found for this search</p>
          <Button variant="default" className="mt-4">
            Back to all items
          </Button>
        </div>
      </div>
    </div>
  );
}

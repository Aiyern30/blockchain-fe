"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Search, Share2, MoreHorizontal, Copy } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from "@/components/ui/";
import { GridView } from "@/lib/view";
import { ViewSelector } from "@/components/ViewSelector";
import { useToast } from "@/hooks/use-toast";
import { formatAddress } from "@/utils/function";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("collected");
  const [gridView, setGridView] = useState<GridView>("medium");
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  console.log("joinedDate", joinedDate);

  useEffect(() => {
    const fetchFirstTransactionDate = async () => {
      if (!address) return;
      const api = "1I4Y5Q9JJ81FQI3ZUV3P382HJMXYWPM3M8";
      try {
        const res = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${api}`
        );
        const data = await res.json();
        if (data.result.length > 0) {
          const firstTx = data.result[0];
          const timestamp = parseInt(firstTx.timeStamp) * 1000;
          const date = new Date(timestamp).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          });
          setJoinedDate(date);
        } else {
          setJoinedDate(null);
        }
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        setJoinedDate(null);
      }
    };

    fetchFirstTransactionDate();
  }, [address]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        variant: "success",
        title: "Copied!",
        description: "Wallet address copied successfully.",
      });
    }
  };

  const handleShare = () => {
    if (address) {
      const profileUrl = `${window.location.origin}/Profile/${address}`;
      navigator.clipboard.writeText(profileUrl);
      toast({
        variant: "success",
        title: "Profile Link Copied!",
        description: "Share your profile link with others.",
      });
    }
  };

  const tabs = [
    { id: "collected", label: "Collected" },
    { id: "offers", label: "Offers made" },
    { id: "deals", label: "Deals" },
    { id: "created", label: "Created" },
    { id: "favorited", label: "Favorited" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="h-[calc(100vh-120px)] bg-background text-foreground">
      <div className="px-4 py-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Unnamed</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <code
                  className="cursor-pointer flex items-center gap-2"
                  onClick={handleCopy}
                >
                  {formatAddress(address)}
                  {isConnected && address && (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </code>

                <span>·</span>
                <span>{joinedDate ? `Joined ${joinedDate}` : ""}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
          </nav>
        </div>

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
          <ViewSelector view={gridView} onChange={setGridView} />
        </div>

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

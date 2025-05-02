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
import type { GridView } from "@/type/view";
import { ViewSelector } from "@/components/ViewSelector";
import { truncateAddress } from "@/utils/function";
import { handleCopy, handleShare } from "@/utils/helper";

export default function ProfilePage() {
  const tabs = [
    { id: "transaction", label: "Transaction" },
    { id: "collected", label: "Collected" },
    { id: "offers", label: "Offers made" },
    { id: "deals", label: "Deals" },
    { id: "created", label: "Created" },
    { id: "favorited", label: "Favorited" },
    { id: "activity", label: "Activity" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [gridView, setGridView] = useState<GridView>("medium");
  const { address: rainbowKitAddress, isConnected } = useAccount();
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn && storedAddress) {
      setWeb3AuthAddress(storedAddress);
    }
  }, []);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    setWalletAddress(
      isConnected ? rainbowKitAddress ?? null : web3AuthAddress ?? null
    );
  }, [isConnected, rainbowKitAddress, web3AuthAddress]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

    const fetchFirstTransactionDate = async () => {
      if (!walletAddress || !apiKey) return;

      try {
        const res = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
        );
        const data = await res.json();

        if (data.result.length > 0) {
          const firstTx = data.result[0];
          const timestamp = Number.parseInt(firstTx.timeStamp) * 1000;
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
  }, [walletAddress]);

  return (
    <div className="h-[calc(100vh-128px)] bg-background text-foreground">
      <div className="px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start items-center justify-between w-full gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-24 h-24 rounded-full bg-blue-600" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">Unnamed</h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-sm text-muted-foreground">
                <code
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => handleCopy(walletAddress ?? "")}
                >
                  {truncateAddress(walletAddress ?? "")}
                  {isConnected && walletAddress && (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </code>
                <span>·</span>
                <span>{joinedDate ? `Joined ${joinedDate}` : ""}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-row mx-auto sm:mx-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare(walletAddress ?? "")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-8 border-b overflow-x-auto">
          <nav className="flex gap-4 whitespace-nowrap overflow-x-auto no-scrollbar scroll-snap-x">
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

        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row w-full gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  Chains
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Ethereum</DropdownMenuItem>
                <DropdownMenuItem>Polygon</DropdownMenuItem>
                <DropdownMenuItem>Optimism</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name" className="pl-8 w-full" />
            </div>
          </div>

          <ViewSelector
            view={gridView}
            onChange={setGridView}
            className="w-full md:w-auto"
          />
        </div>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "block" : "hidden"}
          >
            <div className="mt-12 text-center">
              <p className="text-lg font-medium">
                No items found for {tab.label}
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => {
                  // Reset filters and search
                  // This is a placeholder for the actual reset logic
                  console.log("Resetting filters and search for", tab.label);
                }}
              >
                Back to all {tab.label}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

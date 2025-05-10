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
import {
  fetchAllTransactions,
  type ProcessedTransaction,
} from "@/utils/etherscan";
import { TransactionList } from "./TransactionList";
import { ProfileCollections } from "./ProfileCollection";
import { ProfileWishlist } from "./ProfileWishlist";
import { ProfileCart } from "./ProfileCart";

export default function ProfilePage() {
  const tabs = [
    { id: "transaction", label: "Transaction" },
    { id: "collection", label: "Collection" },
    { id: "cart", label: "Cart" },
    { id: "wishlist", label: "Wishlist" },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [gridView, setGridView] = useState<GridView>("medium");
  const { address: rainbowKitAddress, isConnected } = useAccount();
  const [joinedDate, setJoinedDate] = useState<string | null>(null);
  const [web3AuthAddress, setWeb3AuthAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<ProcessedTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

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
      setIsLoading(true);

      try {
        const res = await fetch(
          `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`
        );
        const data = await res.json();

        if (data.result && data.result.length > 0) {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirstTransactionDate();
  }, [walletAddress]);

  useEffect(() => {
    const getTransactions = async () => {
      if (!walletAddress) return;

      if (activeTab === "transaction") {
        setIsLoadingTransactions(true);
        setTransactionError(null);

        try {
          const txs = await fetchAllTransactions(walletAddress, "sepolia");
          setTransactions(txs);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          setTransactionError(
            error instanceof Error
              ? error.message
              : "Failed to fetch transactions"
          );
        } finally {
          setIsLoadingTransactions(false);
        }
      }
    };

    getTransactions();
  }, [walletAddress, activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "transaction":
        return (
          <TransactionList
            transactions={transactions}
            isLoading={isLoadingTransactions}
          />
        );
      case "collection":
        return <ProfileCollections view={gridView} />;
      case "cart":
        return <ProfileCart view={gridView} />;
      case "wishlist":
        return <ProfileWishlist view={gridView} />;
      default:
        return <EmptyState label={activeTab} />;
    }
  };

  return (
    <div className="h-[calc(100vh-128px)] bg-background text-foreground overflow-auto">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between w-full gap-4 py-4">
          <div className="flex items-center gap-2">
            <code
              className="cursor-pointer flex items-center gap-2 text-sm font-mono bg-muted px-2 py-1 rounded"
              onClick={() => handleCopy(walletAddress ?? "")}
            >
              {truncateAddress(walletAddress ?? "")}
              <Copy className="w-4 h-4 text-muted-foreground" />
            </code>
            {isLoading ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : (
              joinedDate && (
                <span className="text-sm text-muted-foreground">
                  Joined {joinedDate}
                </span>
              )
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleShare(walletAddress ?? "")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleCopy(walletAddress ?? "")}
                >
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleShare(walletAddress ?? "")}
                >
                  Share Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4 border-b overflow-x-auto">
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

        {activeTab === "transaction" ? (
          <div className="mt-4">
            {transactionError && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-950/20 dark:text-red-200">
                <p className="text-sm font-medium">Error: {transactionError}</p>
              </div>
            )}
          </div>
        ) : (
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
        )}

        <div className="flex flex-col flex-grow items-center justify-center min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-12 text-center">
      <p className="text-lg font-medium">No items found for {label}</p>
      <Button
        variant="default"
        className="mt-4"
        onClick={() => {
          // Reset filters and search
          console.log("Resetting filters and search for", label);
        }}
      >
        Back to all {label}
      </Button>
    </div>
  );
}

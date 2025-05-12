/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Image from "next/image";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { ExternalLink, Info } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui";
import CardEmptyUI from "@/components/CardEmptyUI";
import { truncateAddress, formatImageUrl } from "@/utils/function";
import { getERC721Contract } from "@/lib/erc721Config";
import { useFilter } from "@/contexts/filter-context";
import { useCurrency } from "@/contexts/currency-context";

export function PurchasedNft() {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { filter } = useFilter();
  const { view, searchQuery } = filter;

  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [showNFTDetails, setShowNFTDetails] = useState(false);
  const { currencyRates } = useCurrency();

  const fetchPurchasedNFTs = useCallback(async () => {
    try {
      setLoading(true);
      if (!window.ethereum) throw new Error("MetaMask not detected");
      if (!walletClient || !isConnected) return;

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      const items = await nftContract.fetchMyNFTs();

      if (items.length === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }

      const enrichedItems = await Promise.all(
        items.map(async (item: any) => {
          const [itemId, collection, tokenId, seller, owner, price, sold] =
            item;

          const nftContract = new ethers.Contract(
            collection,
            ["function tokenURI(uint256 tokenId) view returns (string)"],
            provider
          );

          let tokenURI = "";
          try {
            tokenURI = await nftContract.tokenURI(tokenId);
          } catch {
            return null;
          }

          const metadataURL = tokenURI.startsWith("ipfs://")
            ? tokenURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
            : tokenURI;

          let metadata: any = {
            name: `NFT #${tokenId}`,
            description: "No description available",
            image: "/placeholder.svg",
            attributes: [],
            price: ethers.formatEther(price),
          };

          try {
            const res = await axios.get(metadataURL);
            metadata = {
              ...metadata,
              ...res.data,
              image: formatImageUrl(res.data.image),
              price: ethers.formatEther(price),
            };
          } catch (err) {
            console.warn("Failed to fetch metadata:", err);
          }

          return {
            tokenId: Number(tokenId),
            metadataUrl: metadataURL,
            owner,
            metadata,
            marketItem: {
              itemId: Number(itemId),
              collection,
              tokenId: Number(tokenId),
              seller,
              owner,
              price: ethers.formatEther(price),
              sold,
            },
          };
        })
      );

      setNfts(enrichedItems.filter((nft) => nft !== null));
    } catch (error) {
      console.error("Error fetching purchased NFTs:", error);
      toast.error("Failed to load your NFTs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [walletClient, isConnected]);

  useEffect(() => {
    if (isConnected) fetchPurchasedNFTs();
  }, [isConnected, fetchPurchasedNFTs]);

  // Filter NFTs based on search query
  const filteredNfts = useMemo(() => {
    if (!searchQuery) return nfts;

    const query = searchQuery.toLowerCase();
    return nfts.filter(
      (nft) =>
        nft.metadata.name.toLowerCase().includes(query) ||
        nft.metadata.description.toLowerCase().includes(query) ||
        nft.marketItem.collection.toLowerCase().includes(query) ||
        nft.tokenId.toString().includes(query)
    );
  }, [nfts, searchQuery]);

  const openNftDetails = (nft: any) => {
    setSelectedNFT(nft);
    setShowNFTDetails(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const gridColumns = {
    small:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    medium:
      "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    large: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    list: "",
  };

  if (loading) {
    if (view === "list") {
      return (
        <div className="mt-6 w-full space-y-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b animate-pulse w-full"
              >
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
        </div>
      );
    }

    return (
      <div className={`mt-6 grid ${gridColumns[view]} gap-4`}>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden cursor-pointer animate-pulse border hover:border-primary hover:shadow-lg transition-shadow"
            >
              <div className="relative h-44 w-full bg-muted">
                <Skeleton className="h-full w-full absolute inset-0" />
              </div>

              <CardHeader className="space-y-1 pb-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-3/5" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardHeader>

              <CardContent className="py-2">
                <Skeleton className="h-4 w-1/2" />
              </CardContent>

              <CardFooter className="pt-1 pb-3 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  if (filteredNfts.length === 0) {
    if (nfts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center">
          <CardEmptyUI
            title="No Purchased NFTs"
            description="You haven't purchased any NFTs yet!"
            buttonText="Explore NFTs"
            type="collection"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full text-center">
        <div className="p-8 rounded-lg border max-w-md">
          <h3 className="text-xl font-semibold mb-2">No matching NFTs</h3>
          <p className="text-muted-foreground mb-4">
            No NFTs match your search criteria. Try adjusting your search.
          </p>
        </div>
      </div>
    );
  }

  if (view === "list") {
    return (
      <>
        <div className="mt-6 w-full">
          <div className="space-y-2 w-full">
            {filteredNfts.map((nft, index) => (
              <div
                key={index}
                className="flex w-full items-center justify-between border rounded-lg px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => openNftDetails(nft)}
              >
                <div className="flex items-center gap-5 w-full">
                  <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={nft.metadata.image || "/placeholder.svg"}
                      alt={nft.metadata.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col w-full overflow-hidden">
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-medium text-base truncate">
                        {nft.metadata.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs shrink-0 ml-2"
                      >
                        Token #{nft.tokenId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {nft.metadata.description || "No description provided"}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground truncate">
                        Collection:{" "}
                        <span className="font-mono">
                          {truncateAddress(nft.marketItem.collection)}
                        </span>
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        {nft.metadata.price} ETH
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNftDetails(nft);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* NFT Details Dialog */}
        <Dialog open={showNFTDetails} onOpenChange={setShowNFTDetails}>
          <DialogContent className="max-w-3xl">
            {selectedNFT && selectedNFT.metadata && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedNFT.metadata.name || `NFT #${selectedNFT.tokenId}`}
                  </DialogTitle>
                  <DialogDescription>
                    Token ID: {selectedNFT.tokenId} • Owner:{" "}
                    {truncateAddress(selectedNFT.owner)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                      <Image
                        src={
                          formatImageUrl(selectedNFT.metadata.image) ||
                          "/placeholder.svg"
                        }
                        alt={
                          selectedNFT.metadata.name ||
                          `NFT #${selectedNFT.tokenId}`
                        }
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("placeholder.svg")) {
                            target.src = "/placeholder.svg";
                          }
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>

                    {selectedNFT.metadata.external_url && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            selectedNFT.metadata?.external_url,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View External Link
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedNFT.metadata.description ||
                          "No description provided"}
                      </p>
                    </div>

                    {selectedNFT.metadata.price && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Price</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">
                            {selectedNFT.metadata.price} ETH
                          </p>
                          <span className="text-sm text-muted-foreground">
                            (≈ $
                            {(
                              Number(selectedNFT.metadata.price) *
                              currencyRates.USD
                            ).toFixed(2)}{" "}
                            USD)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          ≈ RM{" "}
                          {(
                            Number(selectedNFT.metadata.price) *
                            currencyRates.MYR
                          ).toFixed(2)}{" "}
                          MYR
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Attributes
                      </h3>

                      {selectedNFT.metadata.attributes &&
                      selectedNFT.metadata.attributes.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedNFT.metadata.attributes.map(
                            (attr: any, index: number) => (
                              <div
                                key={index}
                                className="border rounded-md p-2 bg-muted/30"
                              >
                                <Badge variant="outline" className="mb-1 w-fit">
                                  {attr.trait_type}
                                </Badge>
                                <p className="text-sm">{attr.value}</p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No attributes for this NFT
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Metadata</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-medium">Token ID:</span>{" "}
                          {selectedNFT.tokenId}
                        </p>
                        <p>
                          <span className="font-medium">Owner:</span>{" "}
                          <span
                            onClick={() => handleCopy(selectedNFT.owner)}
                            className="cursor-pointer text-blue-600 underline"
                            title="Click to copy"
                          >
                            {selectedNFT.owner}
                          </span>
                        </p>
                        <p className="break-all">
                          <span className="font-medium">Metadata URL:</span>{" "}
                          <a
                            href={selectedNFT.metadataUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-all"
                          >
                            {selectedNFT.metadataUrl}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowNFTDetails(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="mt-6 w-full">
        <div className={`grid ${gridColumns[view]} gap-4`}>
          {filteredNfts.map((nft, index) => (
            <Card
              key={index}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border hover:border-primary h-full flex flex-col"
              onClick={() => openNftDetails(nft)}
            >
              <div className="relative h-44 w-full bg-muted">
                <Image
                  src={nft.metadata.image || "/placeholder.svg"}
                  alt={nft.metadata.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader className="space-y-1 pb-1">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-semibold truncate">
                    {nft.metadata.name}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    #{nft.tokenId}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {nft.metadata.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-2 flex-grow">
                <div className="text-xs text-muted-foreground mb-2">
                  Collection:{" "}
                  <span className="font-mono">
                    {truncateAddress(nft.marketItem.collection)}
                  </span>
                </div>
                <div className="font-semibold text-green-600">
                  {nft.metadata.price} ETH
                </div>
              </CardContent>
              <CardFooter className="pt-1 pb-3 flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  OWNED
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNftDetails(nft);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* NFT Details Dialog */}
      <Dialog open={showNFTDetails} onOpenChange={setShowNFTDetails}>
        <DialogContent className="max-w-3xl">
          {selectedNFT && selectedNFT.metadata && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedNFT.metadata.name || `NFT #${selectedNFT.tokenId}`}
                </DialogTitle>
                <DialogDescription>
                  Token ID: {selectedNFT.tokenId} • Owner:{" "}
                  {truncateAddress(selectedNFT.owner)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
                    <Image
                      src={
                        formatImageUrl(selectedNFT.metadata.image) ||
                        "/placeholder.svg"
                      }
                      alt={
                        selectedNFT.metadata.name ||
                        `NFT #${selectedNFT.tokenId}`
                      }
                      fill
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder.svg")) {
                          target.src = "/placeholder.svg";
                        }
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>

                  {selectedNFT.metadata.external_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          selectedNFT.metadata?.external_url,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View External Link
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedNFT.metadata.description ||
                        "No description provided"}
                    </p>
                  </div>

                  {selectedNFT.metadata.price && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Price</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {selectedNFT.metadata.price} ETH
                        </p>
                        <span className="text-sm text-muted-foreground">
                          (≈ $
                          {(
                            Number(selectedNFT.metadata.price) *
                            currencyRates.USD
                          ).toFixed(2)}{" "}
                          USD)
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        ≈ RM{" "}
                        {(
                          Number(selectedNFT.metadata.price) * currencyRates.MYR
                        ).toFixed(2)}{" "}
                        MYR
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Attributes
                    </h3>

                    {selectedNFT.metadata.attributes &&
                    selectedNFT.metadata.attributes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.metadata.attributes.map(
                          (attr: any, index: number) => (
                            <div
                              key={index}
                              className="border rounded-md p-2 bg-muted/30"
                            >
                              <Badge variant="outline" className="mb-1 w-fit">
                                {attr.trait_type}
                              </Badge>
                              <p className="text-sm">{attr.value}</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No attributes for this NFT
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Metadata</h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Token ID:</span>{" "}
                        {selectedNFT.tokenId}
                      </p>
                      <p>
                        <span className="font-medium">Owner:</span>{" "}
                        <span
                          onClick={() => handleCopy(selectedNFT.owner)}
                          className="cursor-pointer text-blue-600 underline"
                          title="Click to copy"
                        >
                          {selectedNFT.owner}
                        </span>
                      </p>
                      <p className="break-all">
                        <span className="font-medium">Metadata URL:</span>{" "}
                        <a
                          href={selectedNFT.metadataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-all"
                        >
                          {selectedNFT.metadataUrl}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNFTDetails(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PurchasedNft;

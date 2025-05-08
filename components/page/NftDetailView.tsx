"use client";

import type React from "react";

import Image from "next/image";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Badge,
} from "@/components/ui";
import { Tag, X, RefreshCw, Flame, ExternalLink, Info } from "lucide-react";
import { NFTActionButtons } from "@/components/nft-action-buttons";
import { formatImageUrl, truncateAddress } from "@/utils/function";
import { handleCopy } from "@/utils/helper";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { NFTOwnershipBadge } from "./NftOwnershipBadge";
import { isNFTOwner, isNFTListed, canResell } from "@/utils/nft-utils";

interface NFTDetailViewProps {
  nft: CollectionNFT;
  userAddress: string;
  currencyRates: { USD: number; MYR: number };
  isInWishlist: boolean;
  isInCart: boolean;
  onOpenListingForm: (nft: CollectionNFT, e: React.MouseEvent) => void;
  onCancelListing: (nft: CollectionNFT, e: React.MouseEvent) => void;
  onOpenResellForm: (nft: CollectionNFT, e: React.MouseEvent) => void;
  onOpenBurnConfirmation: (nft: CollectionNFT, e: React.MouseEvent) => void;
  onAddToWishlist: () => void;
  onRemoveFromWishlist: () => void;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onBuyNow: (e: React.MouseEvent) => void;
  onClose: () => void;
  collectionOwner?: string;
}

export function NFTDetailView({
  nft,
  userAddress,
  currencyRates,
  isInWishlist,
  isInCart,
  onOpenListingForm,
  onCancelListing,
  onOpenResellForm,
  onOpenBurnConfirmation,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
  onClose,
  collectionOwner,
}: NFTDetailViewProps) {
  const isOwner = isNFTOwner(nft, userAddress);
  const isListed = isNFTListed(nft);
  const canResellNFT = canResell(nft, userAddress);

  if (!nft || !nft.metadata) return null;

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {nft.metadata.name || `NFT #${nft.tokenId}`}
          </CardTitle>
          <NFTOwnershipBadge
            nft={nft}
            userAddress={userAddress}
            collectionOwner={collectionOwner || ""}
          />
        </div>
        <CardDescription>
          Token ID: {nft.tokenId} • Owner: {truncateAddress(nft.owner)}
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border">
            <Image
              src={formatImageUrl(nft.metadata.image) || "/placeholder.svg"}
              alt={nft.metadata.name || `NFT #${nft.tokenId}`}
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

          {/* Action buttons based on ownership */}
          {isOwner ? (
            <div className="flex gap-2">
              {!isListed ? (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={(e) => onOpenListingForm(nft, e)}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  List NFT
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => onCancelListing(nft, e)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Listing
                </Button>
              )}
              {canResellNFT && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={(e) => onOpenResellForm(nft, e)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resell NFT
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex-1"
                onClick={(e) => onOpenBurnConfirmation(nft, e)}
              >
                <Flame className="h-4 w-4 mr-2" />
                Burn NFT
              </Button>
            </div>
          ) : (
            // Non-owner actions
            <NFTActionButtons
              nft={nft}
              isInWishlist={isInWishlist}
              isInCart={isInCart}
              onAddToWishlist={onAddToWishlist}
              onRemoveFromWishlist={onRemoveFromWishlist}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              onBuyNow={onBuyNow}
              className="w-full justify-center"
            />
          )}

          {nft.metadata.external_url && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(nft.metadata?.external_url, "_blank")}
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
              {nft.metadata.description || "No description provided"}
            </p>
          </div>

          {nft.metadata.price && (
            <div>
              <h3 className="text-lg font-medium mb-2">Price</h3>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{nft.metadata.price} ETH</p>
                <span className="text-sm text-muted-foreground">
                  (≈ $
                  {(Number(nft.metadata.price) * currencyRates.USD).toFixed(2)}{" "}
                  USD)
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                ≈ RM{" "}
                {(Number(nft.metadata.price) * currencyRates.MYR).toFixed(2)}{" "}
                MYR
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Attributes
            </h3>

            {nft.metadata.attributes && nft.metadata.attributes.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {nft.metadata.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-2 bg-muted/30"
                  >
                    <Badge variant="outline" className="mb-1 w-fit">
                      {attr.trait_type}
                    </Badge>
                    <p className="text-sm">{attr.value}</p>
                  </div>
                ))}
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
                <span className="font-medium">Token ID:</span> {nft.tokenId}
              </p>
              <p>
                <span className="font-medium">Owner:</span>{" "}
                <span
                  onClick={() => handleCopy(nft.owner)}
                  className="cursor-pointer text-blue-600 underline"
                  title="Click to copy"
                >
                  {nft.owner}
                </span>
              </p>
              <p className="break-all">
                <span className="font-medium">Metadata URL:</span>{" "}
                <a
                  href={nft.metadataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {nft.metadataUrl}
                </a>
              </p>
              {nft.marketItem && (
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium mb-1">Market History:</p>
                  <p>
                    <span className="font-medium">Item ID:</span>{" "}
                    {nft.marketItem.itemId}
                  </p>
                  <p>
                    <span className="font-medium">Seller:</span>{" "}
                    {truncateAddress(nft.marketItem.seller)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge
                      variant={nft.marketItem.sold ? "outline" : "default"}
                    >
                      {nft.marketItem.sold ? "Sold" : "Listed"}
                    </Badge>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="mt-6">
        <Button variant="outline" onClick={onClose} className="w-full">
          Close
        </Button>
      </CardFooter>
    </>
  );
}

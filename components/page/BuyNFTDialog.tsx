/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Separator,
  Alert,
  AlertDescription,
} from "@/components/ui";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { formatImageUrl } from "@/utils/function";
import { useCurrency } from "@/contexts/currency-context";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";

interface BuyNFTDialogProps {
  nft: CollectionNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletClient: any;
}

export function BuyNFTDialog({
  nft,
  open,
  onOpenChange,
  walletClient,
}: BuyNFTDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const { currencyRates } = useCurrency();

  // Default price if not specified in metadata
  const price = nft?.metadata?.price
    ? Number.parseFloat(nft.metadata.price)
    : 0.05;
  const serviceFee = price * 0.025; // 2.5% service fee
  const totalPrice = price + serviceFee;

  // Calculate USD and MYR prices using currency rates from provider
  const usdPrice = totalPrice * (currencyRates.USD || 0);
  const myrPrice = totalPrice * (currencyRates.MYR || 0);

  const handleBuyNFT = async () => {
    if (!nft || !walletClient) {
      toast.error("Missing NFT information or wallet connection");
      return;
    }

    if (!nft.metadata?.isListed) {
      toast.error("This NFT is not listed for sale");
      return;
    }

    // Check if marketItem exists
    if (!nft.marketItem) {
      toast.error("Market item information is missing");
      return;
    }

    setIsProcessing(true);
    setPurchaseStatus("Preparing to purchase NFT...");

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Check if user is trying to buy their own NFT
      if (nft.marketItem.seller.toLowerCase() === signerAddress.toLowerCase()) {
        throw new Error("You cannot buy your own NFT");
      }

      // Get the NFT contract
      const nftContract = getERC721Contract(signer);

      // Make sure we have a price
      if (!nft.metadata.price) {
        throw new Error("NFT price information is missing");
      }

      // Get the price in wei
      const priceInWei = ethers.parseEther(nft.metadata.price);

      // Get the item ID from the market item
      const itemId = nft.marketItem.itemId;

      setPurchaseStatus("Processing purchase transaction...");

      // Execute the purchase transaction - only pass itemId as per the contract function
      const tx = await nftContract.createMarketSale(itemId, {
        value: priceInWei,
      });

      setPurchaseStatus("Confirming transaction...");
      const receipt = await tx.wait();

      console.log("Purchase transaction receipt:", receipt);

      setPurchaseStatus("✅ NFT purchased successfully!");
      toast.success(
        `You are now the proud owner of ${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        }!`
      );

      // Close the dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
        // Refresh the page or update the NFT list
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error purchasing NFT:", error);

      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        setPurchaseStatus("❌ Transaction cancelled by user");
        toast.error("Transaction cancelled by user");
      } else {
        setPurchaseStatus(`❌ Error: ${error.message}`);
        toast.error(`Failed to purchase NFT: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!nft) return null;

  // Safely get the image URL
  const imageUrl = nft.metadata?.image
    ? formatImageUrl(nft.metadata.image)
    : "/placeholder.svg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy NFT</DialogTitle>
          <DialogDescription>
            Complete your purchase to own this NFT
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <div className="relative h-20 w-20 rounded-md overflow-hidden border">
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-lg">
              {nft.metadata?.name || `NFT #${nft.tokenId}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              Token ID: {nft.tokenId}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Item price</span>
              <span className="font-medium">{price.toFixed(3)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service fee (2.5%)</span>
              <span className="font-medium">{serviceFee.toFixed(3)} ETH</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{totalPrice.toFixed(3)} ETH</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>USD Equivalent:</span>
                <span>${usdPrice.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>MYR Equivalent:</span>
                <span>RM {myrPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {purchaseStatus && (
            <Alert
              variant={
                purchaseStatus.includes("✅")
                  ? "default"
                  : purchaseStatus.includes("❌")
                  ? "destructive"
                  : "default"
              }
            >
              {purchaseStatus.includes("❌") && (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{purchaseStatus}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="sm:w-auto w-full"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="sm:w-auto w-full"
            onClick={handleBuyNFT}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Buy for ${totalPrice.toFixed(3)} ETH`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

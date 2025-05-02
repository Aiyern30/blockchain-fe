/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
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
} from "@/components/ui";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { formatImageUrl } from "@/utils/function";

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

  // Default price if not specified in metadata
  const price = nft?.metadata?.price ? nft.metadata.price : 0.05;
  const serviceFee = price * 0.025; // 2.5% service fee
  const totalPrice = price + serviceFee;

  // Estimate USD price (assuming 1 ETH = 3000 USD)
  const usdPrice = totalPrice * 3000;

  const handleBuyNFT = async () => {
    if (!nft || !walletClient) {
      toast.error("Missing NFT information or wallet connection");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate a purchase transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("NFT purchased successfully!", {
        description: `You are now the proud owner of ${
          nft.metadata?.name || `NFT #${nft.tokenId}`
        }`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error purchasing NFT:", error);
      toast.error(`Failed to purchase NFT: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!nft) return null;

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
              src={
                formatImageUrl(nft.metadata?.image || "") || "/placeholder.svg"
              }
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
            <div className="text-xs text-muted-foreground text-right">
              ${usdPrice.toFixed(2)} USD
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            className="sm:w-auto w-full"
            onClick={() => onOpenChange(false)}
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

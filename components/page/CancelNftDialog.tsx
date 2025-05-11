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
  Alert,
  AlertDescription,
} from "@/components/ui";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { formatImageUrl } from "@/utils/function";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";

interface CancelNftDialogProps {
  nft: CollectionNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletClient: any;
  onSuccess?: () => void;
}

export function CancelNftDialog({
  nft,
  open,
  onOpenChange,
  walletClient,
  onSuccess,
}: CancelNftDialogProps) {
  const [isCanceling, setIsCanceling] = useState(false);

  const cancelListing = async () => {
    if (!nft || !walletClient) {
      toast.error("Missing NFT or wallet connection");
      return;
    }

    const tokenId = nft.tokenId;

    setIsCanceling(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const marketplaceContract = getERC721Contract(signer);

      console.log(`Canceling listing for token ID ${tokenId}`);

      const gasEstimate = await marketplaceContract.cancelListing.estimateGas(
        tokenId
      );
      const gasLimit = Math.floor(Number(gasEstimate.toString()) * 1.2);

      const tx = await marketplaceContract.cancelListing(tokenId, { gasLimit });

      toast.info("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();

      console.log("Cancel listing transaction receipt:", receipt);
      toast.success("NFT listing canceled successfully");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error canceling NFT listing:", error);
      if (error.message.includes("rejected")) {
        toast.error("Transaction was rejected by the user");
      } else if (error.message.includes("gas")) {
        toast.error("Not enough gas to complete the transaction");
      } else if (error.message.includes("not owner")) {
        toast.error("You are not the owner of this listing");
      } else {
        toast.error(`Failed to cancel listing: ${error.message}`);
      }
    } finally {
      setIsCanceling(false);
    }
  };

  if (!nft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-warning">Cancel NFT Listing</DialogTitle>
          <DialogDescription>
            This will remove your NFT from the marketplace and make it
            unavailable for purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-16 rounded-md overflow-hidden border">
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
            <h3 className="font-medium">
              {nft.metadata?.name || `NFT #${nft.tokenId}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              Token ID: {nft.tokenId}
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Canceling this listing will remove your NFT from the marketplace.
            You can list it again later if you wish.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={cancelListing}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Canceling...
              </>
            ) : (
              "Cancel Listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

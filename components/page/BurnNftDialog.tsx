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

interface BurnNFTDialogProps {
  nft: CollectionNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletClient: any;
  collectionAddress: string;
}

export function BurnNFTDialog({
  nft,
  open,
  onOpenChange,
  walletClient,
  collectionAddress,
}: BurnNFTDialogProps) {
  const [isBurning, setIsBurning] = useState(false);

  const burnNFT = async () => {
    if (!nft || !walletClient) {
      toast.error("Missing NFT information or wallet connection");
      return;
    }

    setIsBurning(true);

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Verify ownership
      if (nft.owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You are not the owner of this NFT");
      }

      const nftContract = getERC721Contract(signer);

      // Call burnNFT function
      const tx = await nftContract.burnNFT(collectionAddress, nft.tokenId);
      await tx.wait();

      toast.success("NFT burned successfully");
      onOpenChange(false); // Close dialog after burn
    } catch (error: any) {
      console.error("Error burning NFT:", error);
      toast.error(`Failed to burn NFT: ${error.message}`);
    } finally {
      setIsBurning(false);
    }
  };

  if (!nft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Burn NFT</DialogTitle>
          <DialogDescription>
            This action is irreversible. The NFT will be permanently destroyed.
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

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Burning an NFT will permanently remove it from the blockchain. This
            action cannot be undone.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={burnNFT}
            disabled={isBurning}
          >
            {isBurning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Burning...
              </>
            ) : (
              "Burn NFT"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { getERC721Contract, getERC721TokenContract } from "@/lib/erc721Config";

interface BurnNFTDialogProps {
  nft: CollectionNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletClient: any;
  collectionAddress: string;
  onSuccess?: () => void;
}

export function BurnNFTDialog({
  nft,
  open,
  onOpenChange,
  walletClient,
  collectionAddress,
  onSuccess,
}: BurnNFTDialogProps) {
  const [isBurning, setIsBurning] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);

  const checkApprovalStatus = async () => {
    if (!nft || !walletClient) return false;

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Get the NFT Collection contract
      const nftCollectionContract = getERC721TokenContract(
        signer,
        collectionAddress
      );

      // Check ownership
      const owner = await nftCollectionContract.ownerOf(nft.tokenId);
      if (owner.toLowerCase() !== signerAddress.toLowerCase()) {
        return false; // Not the owner
      }

      // Check if marketplace contract is approved
      const marketplaceAddress = getERC721Contract(signer).target;
      const approvedAddress = await nftCollectionContract.getApproved(
        nft.tokenId
      );

      // Convert both addresses to strings before comparing them
      return (
        approvedAddress.toString().toLowerCase() ===
        marketplaceAddress.toString().toLowerCase()
      );
    } catch (error) {
      console.error("Error checking approval:", error);
      return false;
    }
  };

  const approveMarketplace = async () => {
    if (!nft || !walletClient) return;

    setIsBurning(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const marketplaceAddress = getERC721Contract(signer).target;
      const nftCollectionContract = getERC721TokenContract(
        signer,
        collectionAddress
      );

      console.log(
        `Approving marketplace ${marketplaceAddress} for token ${nft.tokenId}`
      );
      const tx = await nftCollectionContract.approve(
        marketplaceAddress,
        nft.tokenId
      );
      toast.info("Approval transaction submitted. Waiting for confirmation...");
      await tx.wait();

      toast.success("Marketplace approved to burn the NFT");
      setNeedsApproval(false);
    } catch (error: any) {
      console.error("Error approving marketplace:", error);
      toast.error(`Failed to approve: ${error.message}`);
    } finally {
      setIsBurning(false);
    }
  };

  const burnNFT = async () => {
    if (!nft || !walletClient) {
      toast.error("Missing NFT information or wallet connection");
      return;
    }

    const isApproved = await checkApprovalStatus();
    if (!isApproved) {
      setNeedsApproval(true);
      return;
    }

    setIsBurning(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const marketplaceContract = getERC721Contract(signer);

      console.log(
        `Burning NFT with tokenId ${nft.tokenId} from collection ${collectionAddress}`
      );

      // Estimate gas first to verify the transaction will succeed
      const gasEstimate = await marketplaceContract.burnNFT.estimateGas(
        collectionAddress,
        nft.tokenId
      );

      console.log(`Gas estimate: ${gasEstimate.toString()}`);

      // Add some buffer to the gas estimate
      const gasLimit = Math.floor(Number(gasEstimate.toString()) * 1.2);

      // Call the burnNFT function with the calculated gas limit
      const tx = await marketplaceContract.burnNFT(
        collectionAddress,
        nft.tokenId,
        { gasLimit }
      );

      toast.info("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();

      console.log("Burn transaction receipt:", receipt);
      toast.success("NFT burned successfully");
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error burning NFT:", error);
      if (error.message.includes("not owner nor approved")) {
        setNeedsApproval(true);
        toast.error("You need to approve the marketplace to burn this NFT");
      } else if (error.message.includes("rejected")) {
        toast.error("Transaction was rejected by the user");
      } else if (error.message.includes("gas")) {
        toast.error("Not enough gas to complete the transaction");
      } else {
        toast.error(`Failed to burn NFT: ${error.message}`);
      }
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
            disabled={isBurning}
          >
            Cancel
          </Button>

          {needsApproval ? (
            <Button
              type="button"
              variant="secondary"
              onClick={approveMarketplace}
              disabled={isBurning}
            >
              {isBurning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Marketplace"
              )}
            </Button>
          ) : (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

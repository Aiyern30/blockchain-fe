/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { getERC721Contract } from "@/lib/erc721Config";
import { formatImageUrl } from "@/utils/function";
import type { CollectionNFT } from "@/type/CollectionNFT";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCurrency } from "@/contexts/currency-context";

const SERVICE_FEE_ETH = "0.0015";
const CREATOR_FEE_PERCENT = 0;

const ResellFormSchema = z.object({
  price: z.string().min(1, { message: "Price is required" }),
  unit: z.string().min(1, { message: "Unit is required" }),
});

type ResellFormValues = z.infer<typeof ResellFormSchema>;

interface ResellNFTDialogProps {
  nft: CollectionNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletClient: any;
  onSuccess: () => void;
}

export function ResellNFTDialog({
  nft,
  open,
  onOpenChange,
  walletClient,
  onSuccess,
}: ResellNFTDialogProps) {
  const [isReselling, setIsReselling] = useState(false);
  const [resellStatus, setResellStatus] = useState("");
  const { currencyRates } = useCurrency();

  const form = useForm<ResellFormValues>({
    resolver: zodResolver(ResellFormSchema),
    defaultValues: {
      price: "",
      unit: "ETH",
    },
    mode: "onChange",
  });

  // Calculate price in different units
  const calculatePrice = (price: string, unit: string) => {
    try {
      let priceInEth = 0;

      switch (unit) {
        case "ETH":
          priceInEth = Number.parseFloat(price);
          break;
        case "GWEI":
          priceInEth = Number.parseFloat(price) / 1e9;
          break;
        case "WEI":
          priceInEth = Number.parseFloat(price) / 1e18;
          break;
        default:
          priceInEth = Number.parseFloat(price);
      }

      const serviceFeeEth = Number.parseFloat(SERVICE_FEE_ETH);
      const creatorFeeEth = (priceInEth * CREATOR_FEE_PERCENT) / 100;
      const totalEth = priceInEth - serviceFeeEth - creatorFeeEth;

      return {
        priceInEth,
        serviceFeeEth,
        creatorFeeEth,
        totalEth,
        priceInUSD: priceInEth * currencyRates.USD,
        priceInMYR: priceInEth * currencyRates.MYR,
      };
    } catch (error) {
      console.log(error);
      return {
        priceInEth: 0,
        serviceFeeEth: 0,
        creatorFeeEth: 0,
        totalEth: 0,
        priceInUSD: 0,
        priceInMYR: 0,
      };
    }
  };

  const handleResellNFT = async () => {
    if (!form.formState.isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!nft) {
      toast.error("NFT information is missing");
      return;
    }

    setIsReselling(true);
    setResellStatus("Preparing to resell NFT...");

    try {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      // Get the listing price
      const listingPriceWei = await nftContract.listingPrice();

      // Convert price based on unit
      const price = form.getValues("price");
      const unit = form.getValues("unit");

      let parsedPrice;
      switch (unit) {
        case "ETH":
          parsedPrice = ethers.parseEther(price);
          break;
        case "GWEI":
          parsedPrice = ethers.parseUnits(price, "gwei");
          break;
        case "WEI":
          parsedPrice = ethers.parseUnits(price, "wei");
          break;
        default:
          parsedPrice = ethers.parseEther(price);
      }

      setResellStatus("Reselling NFT...");

      // If we have a marketItem, use reSellToken, otherwise use listNFT
      let tx;
      const collectionAddress = nft.marketItem?.collection || "";

      if (nft.marketItem && nft.marketItem.itemId) {
        console.log("Using reSellToken with itemId:", nft.marketItem.itemId);

        // First, approve the marketplace to transfer the NFT
        const nftTokenContract = new ethers.Contract(
          collectionAddress,
          [
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function approve(address to, uint256 tokenId) external",
            "function getApproved(uint256 tokenId) view returns (address)",
          ],
          signer
        );

        // Check if approval is needed
        const approvedAddress = await nftTokenContract.getApproved(nft.tokenId);
        const nftContractAddress = await nftContract.getAddress();

        if (
          approvedAddress.toLowerCase() !== nftContractAddress.toLowerCase()
        ) {
          setResellStatus("Approving marketplace to transfer your NFT...");
          const approveTx = await nftTokenContract.approve(
            nftContractAddress,
            nft.tokenId
          );
          await approveTx.wait();
          setResellStatus("NFT approved for reselling...");
        }

        // Now resell the token
        tx = await nftContract.reSellToken(nft.marketItem.itemId, parsedPrice, {
          value: listingPriceWei,
        });
      } else {
        console.log("Using listNFT with tokenId:", nft.tokenId);
        tx = await nftContract.listNFT(
          collectionAddress,
          nft.tokenId,
          parsedPrice,
          {
            value: listingPriceWei,
          }
        );
      }

      await tx.wait();

      setResellStatus("✅ NFT listed successfully!");
      toast.success("NFT listed successfully!");

      // Reset form and close dialog
      form.reset();
      setTimeout(() => {
        onOpenChange(false);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error("Error reselling NFT:", error);
      setResellStatus(`❌ Error: ${error.message}`);
      toast.error(`Failed to resell NFT: ${error.message}`);
    } finally {
      setIsReselling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Relist NFT for Sale</DialogTitle>
          <DialogDescription>
            Set your new price and relist your NFT on the marketplace
          </DialogDescription>
        </DialogHeader>

        {nft && (
          <div className="flex items-center gap-4 mb-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
              <Image
                src={
                  formatImageUrl(nft.metadata?.image || "") ||
                  "/placeholder.svg"
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
              <p className="text-xs text-green-600 mt-1">
                {nft.marketItem
                  ? "Previously sold on marketplace"
                  : "First time listing"}
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.000001"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="ETH" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="GWEI">GWEI</SelectItem>
                        <SelectItem value="WEI">WEI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("price") && (
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Listing price</span>
                  <span className="font-medium">
                    {form.watch("price")} {form.watch("unit")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fees</span>
                  <span className="font-medium">{SERVICE_FEE_ETH} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Creator Fees</span>
                  <span className="font-medium">{CREATOR_FEE_PERCENT}%</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total potential earnings</span>
                  <span>
                    {calculatePrice(
                      form.watch("price") || "0",
                      form.watch("unit") || "ETH"
                    ).totalEth.toFixed(6)}{" "}
                    ETH
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Estimated value</span>
                  <div className="text-right">
                    <div>
                      $
                      {calculatePrice(
                        form.watch("price") || "0",
                        form.watch("unit") || "ETH"
                      ).priceInUSD.toFixed(2)}{" "}
                      USD
                    </div>
                    <div>
                      RM
                      {calculatePrice(
                        form.watch("price") || "0",
                        form.watch("unit") || "ETH"
                      ).priceInMYR.toFixed(2)}{" "}
                      MYR
                    </div>
                  </div>
                </div>
              </div>
            )}

            {resellStatus && (
              <Alert
                variant={
                  resellStatus.includes("✅") ? "default" : "destructive"
                }
              >
                <AlertDescription>{resellStatus}</AlertDescription>
              </Alert>
            )}

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
                onClick={handleResellNFT}
                disabled={!form.formState.isValid || isReselling}
              >
                {isReselling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reselling...
                  </>
                ) : (
                  "Relist NFT"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

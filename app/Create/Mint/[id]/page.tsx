"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import NFTMintingUI from "@/components/page/Explore/Create/Drop/NFTMintingUI";
import Image from "next/image";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Badge,
  Separator,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui";
import { getERC721Contract } from "@/lib/erc721Config";
import { cn } from "@/lib/utils";
import type { StagingStatus } from "@/type/stagingStatus";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import {
  Upload,
  Loader2,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  Tag,
  Flame,
  AlertTriangle,
  ShieldAlert,
  Eye,
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { z } from "zod";
import { useParams } from "next/navigation";
import type { CollectionNFT } from "@/type/CollectionNFT";
import type { NFTMetadata } from "@/type/NFT";
import { STATUS_STAGES } from "@/type/StatusStages";
import { formatImageUrl, truncateAddress } from "@/utils/function";
import { handleCopy } from "@/utils/helper";
import { uploadMetadataToIPFS, uploadToIPFS } from "@/utils/uploadIPFS";

const SERVICE_FEE_ETH = "0.0015";
const CREATOR_FEE_PERCENT = 0;

const attributeSchema = z.object({
  trait_type: z.string().min(1, { message: "Trait type is required" }),
  value: z.string().min(1, { message: "Value is required" }),
});

const NFTFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),

  image: z.string().min(1, { message: "Image is required" }),

  external_url: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),

  attributes: z.array(attributeSchema).default([]),
});

const ListingFormSchema = z.object({
  price: z.string().min(1, { message: "Price is required" }),
  unit: z.string().min(1, { message: "Unit is required" }),
});

type NFTFormValues = z.infer<typeof NFTFormSchema>;
type AttributeFormValues = z.infer<typeof attributeSchema>;
type ListingFormValues = z.infer<typeof ListingFormSchema>;

interface CurrencyRate {
  [key: string]: number;
}

export default function CollectionNFTsPage() {
  const params = useParams();
  const collectionAddress = params.id as string;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const { data: walletClient } = useWalletClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string[] | null>(null);
  const [showMintingUI, setShowMintingUI] = useState(false);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionOwner, setCollectionOwner] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [collectionNFTs, setCollectionNFTs] = useState<CollectionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNFTForm, setShowNFTForm] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");

  // State for NFT details dialog
  const [selectedNFT, setSelectedNFT] = useState<CollectionNFT | null>(null);
  const [showNFTDetails, setShowNFTDetails] = useState(false);

  // State for listing dialog
  const [showListingForm, setShowListingForm] = useState(false);
  const [listingNFT, setListingNFT] = useState<CollectionNFT | null>(null);
  const [isListing, setIsListing] = useState(false);
  const [listingStatus, setListingStatus] = useState("");
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate>({
    USD: 0,
    MYR: 0,
  });

  // State for burn confirmation
  const [showBurnConfirmation, setShowBurnConfirmation] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  // State for attribute dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<AttributeFormValues>({
    trait_type: "",
    value: "",
  });

  // Forms
  const form = useForm<NFTFormValues>({
    resolver: zodResolver(NFTFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      external_url: "",
      attributes: [],
    },
    mode: "onChange",
  });

  const listingForm = useForm<ListingFormValues>({
    resolver: zodResolver(ListingFormSchema),
    defaultValues: {
      price: "",
      unit: "ETH",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,myr"
        );
        const data = await response.json();
        setCurrencyRates({
          USD: data.ethereum.usd,
          MYR: data.ethereum.myr,
        });
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
        setCurrencyRates({
          USD: 3000,
          MYR: 14000,
        });
      }
    };

    fetchEthPrice();
  }, []);

  // Fetch collection details and NFTs
  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!walletClient || !collectionAddress) return;

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        setUserAddress(signerAddress);

        const nftContract = getERC721Contract(signer);

        // Fetch collection details
        const details = await nftContract.collectionDetails(collectionAddress);
        setCollectionName(details.name);

        // Fetch collection owner
        const owner = await nftContract.collectionOwner(collectionAddress);
        setCollectionOwner(owner);

        // Check if current user is the owner
        setIsOwner(owner.toLowerCase() === signerAddress.toLowerCase());

        // Fetch NFTs in the collection
        const nfts = await nftContract.viewCollectionNFTs(collectionAddress);

        // Process NFTs data
        const processedNFTs = await Promise.all(
          nfts.map(async (nft: any) => {
            const tokenId = Number(nft[0]);
            const metadataUrl = nft[1];
            const owner = nft[2];

            // Fetch metadata if available
            let metadata: NFTMetadata | undefined;
            try {
              if (metadataUrl) {
                const response = await fetch(metadataUrl);
                if (response.ok) {
                  metadata = await response.json();
                }
              }
            } catch (error) {
              console.error(
                `Failed to fetch metadata for token ${tokenId}:`,
                error
              );
            }

            return {
              tokenId,
              metadataUrl,
              owner,
              metadata,
            };
          })
        );

        setCollectionNFTs(processedNFTs);
      } catch (error) {
        console.error("Failed to fetch collection data:", error);
        toast.error("Failed to load collection data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionData();
  }, [walletClient, collectionAddress, mintingStatus]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 50MB!");
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      form.setValue("image", fileUrl, { shouldValidate: true });
      setImageUrl(fileUrl);
    }
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const addAttribute = () => {
    if (!newAttribute.trait_type || !newAttribute.value) {
      toast.error("Both trait type and value are required");
      return;
    }

    const currentAttributes = form.getValues("attributes") || [];
    form.setValue("attributes", [...currentAttributes, newAttribute]);

    // Reset the form
    setNewAttribute({ trait_type: "", value: "" });
    setDialogOpen(false);
  };

  const removeAttribute = (index: number) => {
    const currentAttributes = [...form.getValues("attributes")];
    currentAttributes.splice(index, 1);
    form.setValue("attributes", currentAttributes);
  };

  const onSubmit = async (data: NFTFormValues) => {
    if (!isOwner) {
      toast.error("Only the collection owner can mint NFTs");
      return;
    }

    setIsSubmitting(true);
    setShowMintingUI(true);

    // 1. Checking Wallet
    setMintingStatus("checking");
    await delay(STATUS_STAGES.checking.duration);

    if (!walletClient || !collectionAddress) {
      toast.warning("Please connect your wallet and select a collection!", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
      setMintingStatus("error");
      setIsSubmitting(false);
      return;
    }

    if (!data.image) {
      toast.warning("Image Required", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
      setMintingStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Uploading to IPFS
      setMintingStatus("uploading");
      console.log("📤 Uploading image to IPFS...");
      await delay(STATUS_STAGES.uploading.duration / 2);

      const imageBlob = await fetch(data.image).then((res) => res.blob());
      const imageFile = new File([imageBlob], "NFT_Image.jpg", {
        type: imageBlob.type,
      });

      const imageUrl = await uploadToIPFS(imageFile);

      // Prepare metadata
      const metadata = {
        name: data.name,
        description: data.description,
        image: imageUrl,
        external_url: data.external_url || undefined,
        attributes: data.attributes,
      };

      console.log("📤 Uploading metadata to IPFS...");
      await delay(STATUS_STAGES.uploading.duration / 2);

      const metadataUrl = await uploadMetadataToIPFS(metadata);

      // 3. Minting on Blockchain
      setMintingStatus("minting");
      await delay(STATUS_STAGES.minting.duration);

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      try {
        const tx = await nftContract.mintIntoCollection(
          collectionAddress,
          metadataUrl
        );

        const receipt = await tx.wait();
        console.log("🎯 NFT minted:", receipt);

        setTxHash([receipt.hash]);

        // 4. Done
        setMintingStatus("done");
        toast.success("NFT Minted Successfully!", {});
        form.reset();
        setImageUrl(null);
        setShowNFTForm(false);
      } catch (error: any) {
        console.error("❌ Error minting NFT:", error);

        if (error.code === "ACTION_REJECTED" || error.code === 4001) {
          setMintingStatus("cancelled");
          toast.error("Transaction cancelled by user", {});
        } else if (error.message && error.message.includes("already exists")) {
          setMintingStatus("exists");
          toast.error("NFT already exists", {});
        } else {
          setMintingStatus("error");
          toast.error("Failed to mint NFT. Please try again", {});
        }
      }
    } catch (error) {
      console.error("❌ Error in process:", error);
      setMintingStatus("error");
      toast.error("Failed to mint NFT. Please try again", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setShowMintingUI(false);
    setMintingStatus("idle");
    setTxHash(null);
  };

  const openNFTDetails = (nft: CollectionNFT) => {
    setSelectedNFT(nft);
    setShowNFTDetails(true);
  };

  // Check if user is the NFT owner
  const isNFTOwner = (nft: CollectionNFT) => {
    return nft.owner.toLowerCase() === userAddress.toLowerCase();
  };

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

  const openListingForm = (nft: CollectionNFT, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isNFTOwner(nft)) {
      toast.error("Only the NFT owner can list this NFT");
      return;
    }

    setListingNFT(nft);
    setShowListingForm(true);
    listingForm.reset({
      price: "",
      unit: "ETH",
    });
    setListingStatus("");
  };

  const openBurnConfirmation = (nft: CollectionNFT, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isNFTOwner(nft)) {
      toast.error("Only the NFT owner can burn this NFT");
      return;
    }

    setListingNFT(nft);
    setShowBurnConfirmation(true);
  };

  const listNFT = async (signer: ethers.Signer) => {
    if (!listingNFT || !listingForm.getValues("price")) {
      setListingStatus("Please provide all required fields.");
      return;
    }

    const tokenId = listingNFT.tokenId;
    console.log("Token ID:", tokenId);
    const price = listingForm.getValues("price");
    const unit = listingForm.getValues("unit");
    const listingFee = SERVICE_FEE_ETH;

    try {
      // Check if user is the NFT owner
      const signerAddress = await signer.getAddress();
      if (listingNFT.owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You are not the owner of this NFT");
      }

      // Convert listing fee and price based on unit
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

      const parsedListingFee = ethers.parseEther(listingFee);

      // Get contract instance using the helper function
      const marketplaceAddress = "0x10Fe685dBce6329D9899d426F6c5383DeF2B00e2"; // your deployed marketplace address

      // Step 1: Approve the marketplace contract to handle the NFT transfer
      const nftTokenContract = new ethers.Contract(
        collectionAddress,
        [
          "function ownerOf(uint256 tokenId) view returns (address)",
          "function approve(address to, uint256 tokenId) external",
          "function getApproved(uint256 tokenId) view returns (address)",
        ],
        signer
      );

      // Check if the marketplace is already approved
      const approvedAddress = await nftTokenContract.getApproved(tokenId);
      if (approvedAddress.toLowerCase() !== marketplaceAddress.toLowerCase()) {
        setListingStatus("Approving marketplace to transfer your NFT...");
        const tx = await nftTokenContract.approve(marketplaceAddress, tokenId);
        await tx.wait();
        setListingStatus("NFT approved for listing...");
      } else {
        setListingStatus("Marketplace already approved for this NFT...");
      }

      // Step 2: List the NFT on the marketplace
      const marketplaceContract = new ethers.Contract(
        marketplaceAddress,
        [
          "function listNFT(address collection, uint256 tokenId, uint256 price) external payable",
        ],
        signer
      );

      setListingStatus("Listing NFT on marketplace...");
      const txList = await marketplaceContract.listNFT(
        collectionAddress,
        tokenId,
        parsedPrice,
        {
          value: parsedListingFee,
        }
      );

      await txList.wait();

      setListingStatus("✅ NFT listed successfully!");
      toast.success("NFT listed successfully!");
      setShowListingForm(false);

      // Refresh NFT data
      // This would typically update the UI to show the NFT is now listed
    } catch (err: any) {
      console.error("Error listing NFT:", err);
      setListingStatus(`❌ Error: ${err.message}`);
      toast.error(`Failed to list NFT: ${err.message}`);
    }
  };

  const handleListNFT = async () => {
    if (!listingForm.formState.isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsListing(true);
    setListingStatus("Preparing to list NFT...");

    try {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      await listNFT(signer);
    } catch (err: any) {
      console.error("Error in handleListNFT:", err);
      setListingStatus(`❌ Error: ${err.message}`);
      toast.error(`Failed to list NFT: ${err.message}`);
    } finally {
      setIsListing(false);
    }
  };

  const burnNFT = async () => {
    if (!listingNFT || !walletClient) {
      toast.error("Missing NFT information or wallet connection");
      return;
    }

    setIsBurning(true);

    try {
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Check if user is the NFT owner
      if (listingNFT.owner.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You are not the owner of this NFT");
      }

      const nftContract = getERC721Contract(signer);

      // Call the burn function (assuming your contract has a burn function)
      const tx = await nftContract.burnNFT(
        collectionAddress,
        listingNFT.tokenId
      );
      await tx.wait();

      toast.success("NFT burned successfully");
      setShowBurnConfirmation(false);

      // Remove the burned NFT from the list
      setCollectionNFTs((prev) =>
        prev.filter(
          (nft) =>
            !(
              nft.tokenId === listingNFT.tokenId &&
              nft.owner === listingNFT.owner
            )
        )
      );
    } catch (error: any) {
      console.error("Error burning NFT:", error);
      toast.error(`Failed to burn NFT: ${error.message}`);
    } finally {
      setIsBurning(false);
    }
  };

  if (showMintingUI) {
    return (
      <NFTMintingUI
        status={mintingStatus}
        txHash={txHash}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {collectionName || "Collection"}
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your NFTs in this collection
            {collectionOwner && (
              <span className="ml-1 text-xs">
                • Owner:{" "}
                <span className="font-mono">
                  {truncateAddress(collectionOwner)}
                </span>
              </span>
            )}
          </p>
        </div>

        {!isLoading && (
          <div className="flex items-center gap-2">
            <Badge
              variant={isOwner ? "default" : "outline"}
              className="px-3 py-1"
            >
              {isOwner ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Collection Owner
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View Only
                </>
              )}
            </Badge>
          </div>
        )}
      </div>

      {!isLoading && !isOwner && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>View-only mode</AlertTitle>
          <AlertDescription>
            You are not the owner of this collection. You can view the NFTs but
            cannot mint, list, or burn them.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Add New NFT Card - Only visible to collection owner */}
          {isOwner && (
            <Card
              className="overflow-hidden cursor-pointer group relative h-[240px]"
              onClick={() => setShowNFTForm(true)}
            >
              <div className="flex flex-col items-center justify-center h-full bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="rounded-full bg-primary/10 p-4 mb-3">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium">Add New NFT</p>
              </div>
            </Card>
          )}

          {/* NFT Cards */}
          {collectionNFTs.map((nft, index) => (
            <Card
              key={index}
              className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow group relative"
              onClick={() => openNFTDetails(nft)}
            >
              <div className="relative h-40 bg-muted overflow-hidden">
                {nft.metadata?.image ? (
                  <Image
                    src={
                      formatImageUrl(nft.metadata.image) || "/placeholder.svg"
                    }
                    alt={nft.metadata.name || `NFT #${nft.tokenId}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("placeholder.svg")) {
                        target.src = "/placeholder.svg";
                      }
                      e.currentTarget.onerror = null;
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}

                {/* Hover Actions Overlay - Only visible to NFT owner */}
                {isNFTOwner(nft) && (
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex items-center gap-1"
                      onClick={(e) => openListingForm(nft, e)}
                    >
                      <Tag className="h-4 w-4" />
                      List
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={(e) => openBurnConfirmation(nft, e)}
                    >
                      <Flame className="h-4 w-4" />
                      Burn
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-3 flex-grow">
                <h3 className="font-medium truncate">
                  {nft.metadata?.name || `NFT #${nft.tokenId}`}
                </h3>
                {nft.metadata?.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {nft.metadata.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-3 pt-0">
                {nft.metadata?.external_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(nft.metadata?.external_url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View External Link
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* NFT Form Dialog */}
      <Dialog open={showNFTForm} onOpenChange={setShowNFTForm}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              Create NFT in {collectionName || "Collection"}
            </DialogTitle>
            <DialogDescription>
              Add a new NFT to your collection
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NFT Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome NFT" {...field} />
                        </FormControl>
                        <FormDescription>The name of your NFT</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your NFT..."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed description of your NFT
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="external_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External Link (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://your-website.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to your website or social media
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            form.formState.errors.image && "text-red-500"
                          )}
                        >
                          NFT Image
                        </FormLabel>
                        <FormControl>
                          <div
                            className={cn(
                              "border border-dashed border-zinc-700 rounded-lg w-full h-[240px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden mx-auto",
                              "hover:bg-muted/50 transition-colors"
                            )}
                            onClick={() =>
                              document.getElementById("file-input")?.click()
                            }
                          >
                            <input
                              id="file-input"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                handleFileInput(e);
                                if (e.target.files?.[0]) {
                                  const fileUrl = URL.createObjectURL(
                                    e.target.files[0]
                                  );
                                  field.onChange(fileUrl);
                                }
                              }}
                            />
                            {imageUrl ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={imageUrl || "/placeholder.svg"}
                                  alt="Uploaded NFT image"
                                  fill
                                  className="object-contain p-2"
                                  unoptimized
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageUrl(null);
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center p-4">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">
                                  Drag and drop media
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Browse files
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max size: 50MB
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  JPG, PNG, GIF, SVG, MP4
                                </p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription className="text-center">
                          Upload an image for your NFT
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="attributes"
                    render={() => (
                      <FormItem className="border rounded-lg p-4">
                        <FormLabel>Attributes</FormLabel>
                        <FormDescription>
                          Add traits and properties to your NFT
                        </FormDescription>

                        <div className="mt-3">
                          {form.watch("attributes")?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {form.watch("attributes").map((attr, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between border rounded-md p-2 bg-muted/30"
                                >
                                  <div className="flex flex-col">
                                    <Badge
                                      variant="outline"
                                      className="mb-1 w-fit"
                                    >
                                      {attr.trait_type}
                                    </Badge>
                                    <span className="text-sm">
                                      {attr.value}
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAttribute(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-muted/20 rounded-md mb-4">
                              <p className="text-sm text-muted-foreground">
                                No attributes added yet
                              </p>
                            </div>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Attribute
                          </Button>
                        </div>

                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add NFT Attribute</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <FormLabel htmlFor="trait-type">
                                  Trait Type
                                </FormLabel>
                                <Input
                                  id="trait-type"
                                  placeholder="e.g. Color, Size, Rarity"
                                  value={newAttribute.trait_type}
                                  onChange={(e) =>
                                    setNewAttribute({
                                      ...newAttribute,
                                      trait_type: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="grid gap-2">
                                <FormLabel htmlFor="trait-value">
                                  Value
                                </FormLabel>
                                <Input
                                  id="trait-value"
                                  placeholder="e.g. Blue, Large, Legendary"
                                  value={newAttribute.value}
                                  onChange={(e) =>
                                    setNewAttribute({
                                      ...newAttribute,
                                      value: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button type="button" onClick={addAttribute}>
                                Add Attribute
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNFTForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating NFT...
                    </>
                  ) : (
                    "Create NFT"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                        "/placeholder.svg" ||
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

                  {/* Only show action buttons to NFT owner */}
                  {isNFTOwner(selectedNFT) && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNFTDetails(false);
                          openListingForm(selectedNFT, e as any);
                        }}
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        List NFT
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNFTDetails(false);
                          openBurnConfirmation(selectedNFT, e as any);
                        }}
                      >
                        <Flame className="h-4 w-4 mr-2" />
                        Burn NFT
                      </Button>
                    </div>
                  )}

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

                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Attributes
                    </h3>

                    {selectedNFT.metadata.attributes &&
                    selectedNFT.metadata.attributes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.metadata.attributes.map((attr, index) => (
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

      {/* NFT Listing Dialog */}
      <Dialog open={showListingForm} onOpenChange={setShowListingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set your price and list your NFT on the marketplace
            </DialogDescription>
          </DialogHeader>

          {listingNFT && (
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image
                  src={
                    formatImageUrl(listingNFT.metadata?.image || "") ||
                    "/placeholder.svg"
                  }
                  alt={
                    listingNFT.metadata?.name || `NFT #${listingNFT.tokenId}`
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">
                  {listingNFT.metadata?.name || `NFT #${listingNFT.tokenId}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Token ID: {listingNFT.tokenId}
                </p>
              </div>
            </div>
          )}

          <Form {...listingForm}>
            <form className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={listingForm.control}
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
                  control={listingForm.control}
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

              {listingForm.watch("price") && (
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Listing price</span>
                    <span className="font-medium">
                      {listingForm.watch("price")} {listingForm.watch("unit")}
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
                        listingForm.watch("price") || "0",
                        listingForm.watch("unit") || "ETH"
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
                          listingForm.watch("price") || "0",
                          listingForm.watch("unit") || "ETH"
                        ).priceInUSD.toFixed(2)}{" "}
                        USD
                      </div>
                      <div>
                        RM
                        {calculatePrice(
                          listingForm.watch("price") || "0",
                          listingForm.watch("unit") || "ETH"
                        ).priceInMYR.toFixed(2)}{" "}
                        MYR
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {listingStatus && (
                <Alert
                  variant={
                    listingStatus.includes("✅") ? "default" : "destructive"
                  }
                >
                  <AlertDescription>{listingStatus}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowListingForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleListNFT}
                  disabled={!listingForm.formState.isValid || isListing}
                >
                  {isListing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Listing...
                    </>
                  ) : (
                    "List NFT"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Burn NFT Confirmation Dialog */}
      <Dialog
        open={showBurnConfirmation}
        onOpenChange={setShowBurnConfirmation}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Burn NFT</DialogTitle>
            <DialogDescription>
              This action is irreversible. The NFT will be permanently
              destroyed.
            </DialogDescription>
          </DialogHeader>

          {listingNFT && (
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image
                  src={
                    formatImageUrl(listingNFT.metadata?.image || "") ||
                    "/placeholder.svg"
                  }
                  alt={
                    listingNFT.metadata?.name || `NFT #${listingNFT.tokenId}`
                  }
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">
                  {listingNFT.metadata?.name || `NFT #${listingNFT.tokenId}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Token ID: {listingNFT.tokenId}
                </p>
              </div>
            </div>
          )}

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Burning an NFT will permanently remove it from the blockchain.
              This action cannot be undone.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBurnConfirmation(false)}
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
    </div>
  );
}

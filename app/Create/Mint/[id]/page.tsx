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
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { z } from "zod";
import { useParams } from "next/navigation";
import { uploadMetadataToIPFS, uploadToIPFS } from "@/utils/uploadIPFS";
import { handleCopy } from "@/utils/helper";
import { STATUS_STAGES } from "@/type/StatusStages";

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

type NFTFormValues = z.infer<typeof NFTFormSchema>;
type AttributeFormValues = z.infer<typeof attributeSchema>;

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: { trait_type: string; value: string }[];
}

interface CollectionNFT {
  tokenId: number;
  metadataUrl: string;
  owner: string;
  metadata?: NFTMetadata;
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
  const [collectionNFTs, setCollectionNFTs] = useState<CollectionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNFTForm, setShowNFTForm] = useState(false);

  // State for NFT details dialog
  const [selectedNFT, setSelectedNFT] = useState<CollectionNFT | null>(null);
  const [showNFTDetails, setShowNFTDetails] = useState(false);

  // State for attribute dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<AttributeFormValues>({
    trait_type: "",
    value: "",
  });

  // Fetch collection details and NFTs
  useEffect(() => {
    const fetchCollectionData = async () => {
      if (!walletClient || !collectionAddress) return;

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const nftContract = getERC721Contract(signer);

        // Fetch collection details
        const details = await nftContract.collectionDetails(collectionAddress);
        setCollectionName(details.name);

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

  const formatImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg";

    if (imageUrl.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${imageUrl.replace("ipfs://", "")}`;
    }

    return imageUrl;
  };

  const openNFTDetails = (nft: CollectionNFT) => {
    setSelectedNFT(nft);
    setShowNFTDetails(true);
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
          </p>
        </div>
      </div>

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
          {/* Add New NFT Card */}
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

          {/* NFT Cards */}
          {collectionNFTs.map((nft, index) => (
            <Card
              key={index}
              className="overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
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
                    className="object-cover transition-transform duration-300 group-hover:scale-110 hover:scale-110"
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
                      e.stopPropagation(); // Prevent opening the NFT details dialog
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
    </div>
  );
}

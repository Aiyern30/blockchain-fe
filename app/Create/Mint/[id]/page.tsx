"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import NFTMintingUI from "@/components/page/Explore/Create/Drop/NFTMintingUI";
import Image from "next/image";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
  DialogFooter,
  Badge,
  Separator,
} from "@/components/ui";
import { getERC721Contract } from "@/lib/erc721Config";
import { cn } from "@/lib/utils";
import type { StagingStatus } from "@/type/stagingStatus";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import { Upload, Loader2, X, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { z } from "zod";
import { useParams } from "next/navigation";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

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

  background_color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, {
      message: "Must be a valid 6-digit hex color (e.g. #FFFFFF)",
    })
    .optional(),

  attributes: z.array(attributeSchema).default([]),
});

type NFTFormValues = z.infer<typeof NFTFormSchema>;
type AttributeFormValues = z.infer<typeof attributeSchema>;

export default function MintIntoCollection() {
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

  // State for attribute dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<AttributeFormValues>({
    trait_type: "",
    value: "",
  });

  // Fetch collection details
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      if (!walletClient || !collectionAddress) return;

      try {
        const provider = new ethers.BrowserProvider(walletClient);
        const signer = await provider.getSigner();
        const nftContract = getERC721Contract(signer);

        const details = await nftContract.collectionDetails(collectionAddress);
        setCollectionName(details.name);
      } catch (error) {
        console.error("Failed to fetch collection details:", error);
        toast.error("Failed to load collection details");
      }
    };

    fetchCollectionDetails();
  }, [walletClient, collectionAddress]);

  const form = useForm<NFTFormValues>({
    resolver: zodResolver(NFTFormSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      external_url: "",
      background_color: "#FFFFFF",
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

  const STATUS_STAGES = {
    idle: { label: "Idle", duration: 0 },
    checking: { label: "Checking Wallet", duration: 1500 },
    uploading: { label: "Uploading to IPFS", duration: 2000 },
    minting: { label: "Minting on Blockchain", duration: 2500 },
    exists: { label: "NFT Already Exists", duration: 0 },
    done: { label: "Minting Complete", duration: 0 },
    cancelled: { label: "Transaction Cancelled", duration: 0 },
    error: { label: "Error Occurred", duration: 0 },
  };

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

  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("❌ File upload failed");
    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) throw new Error("❌ Metadata upload failed");
    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
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
        background_color: data.background_color?.replace("#", "") || undefined,
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
    <>
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Create NFT in {collectionName || "Collection"}</CardTitle>
          <CardDescription>Add a new NFT to your collection</CardDescription>
        </CardHeader>
        <CardContent>
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

                  <FormField
                    control={form.control}
                    name="background_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <div className="flex-1 flex items-center">
                              <Input
                                type="color"
                                {...field}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value.startsWith("#") &&
                                    value.length <= 7
                                  ) {
                                    field.onChange(value);
                                  }
                                }}
                                placeholder="#FFFFFF"
                                className="ml-2 w-28"
                              />
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          Background color for your NFT (HEX)
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

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                  className="w-full md:w-auto"
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
        </CardContent>
      </Card>
    </>
  );
}

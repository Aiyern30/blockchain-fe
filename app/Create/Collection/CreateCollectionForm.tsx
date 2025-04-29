/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui";
import { useWalletClient } from "wagmi";

import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import { cn } from "@/lib/utils";
import type { StagingStatus } from "@/type/stagingStatus";
import NFTMintingUI from "@/components/page/Explore/Create/Drop/NFTMintingUI";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

const collectionFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  symbol: z
    .string()
    .min(1, { message: "Symbol is required" })
    .max(10, { message: "Symbol must be less than 10 characters" })
    .refine((val) => /^[A-Z0-9]+$/.test(val), {
      message: "Symbol must be uppercase letters and numbers only",
    }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  image: z.string().min(1, { message: "Image is required" }),
  externalLink: z
    .string()
    .url({ message: "Must be a valid URL" })
    .optional()
    .or(z.literal("")),
});

type CollectionFormValues = z.infer<typeof collectionFormSchema>;

export function CreateCollectionForm() {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const { data: walletClient } = useWalletClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for minting status and transaction hash
  const [mintingStatus, setMintingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string[] | null>(null);
  const [showMintingUI, setShowMintingUI] = useState(false);

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

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      image: "",
      externalLink: "",
    },
    mode: "onChange",
  });

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
  const onSubmit = async (data: CollectionFormValues) => {
    setIsSubmitting(true);
    setShowMintingUI(true);

    // 1. Checking Wallet
    setMintingStatus("checking");
    await delay(STATUS_STAGES.checking.duration);

    if (!walletClient) {
      toast.warning("Please complete all fields and connect your wallet!", {
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
      await delay(STATUS_STAGES.uploading.duration);

      const imageBlob = await fetch(data.image).then((res) => res.blob());
      const imageFile = new File([imageBlob], "collection_image.jpg", {
        type: imageBlob.type,
      });

      const imageUrl = await uploadToIPFS(imageFile);

      // 3. Minting on Blockchain
      setMintingStatus("minting");
      await delay(STATUS_STAGES.minting.duration);

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      try {
        const tx = await nftContract.createCollection(
          data.name,
          data.symbol,
          data.description,
          imageUrl,
          data.externalLink || ""
        );

        const receipt = await tx.wait();
        console.log("🎯 Collection created:", receipt);

        setTxHash([receipt.hash]);

        // 4. Done
        setMintingStatus("done");
        toast.success("Collection Created!", {});
        form.reset();
      } catch (error: any) {
        console.error("❌ Error creating collection:", error);

        if (error.code === "ACTION_REJECTED" || error.code === 4001) {
          setMintingStatus("cancelled");
          toast.error("Transaction cancelled by user", {});
        } else if (error.message && error.message.includes("already exists")) {
          setMintingStatus("exists");
          toast.error("Collection already exists", {});
        } else {
          setMintingStatus("error");
          toast.error("Failed to create collection. Please try again", {});
        }
      }
    } catch (error) {
      console.error("❌ Error in process:", error);
      setMintingStatus("error");
      toast.error("Failed to create collection. Please try again", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleRetry = () => {
    setShowMintingUI(false);
    setMintingStatus("idle");
    setTxHash(null);
  };

  // Show minting UI when submitting
  if (showMintingUI) {
    return (
      <NFTMintingUI
        status={mintingStatus}
        txHash={txHash}
        walletAddress={walletClient?.account.address}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <>
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Create Collection</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Collection" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your NFT collection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MAC"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      A short uppercase symbol for your collection (e.g., BTC,
                      ETH)
                    </FormDescription>
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
                        placeholder="Describe your collection..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of your collection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      Logo Image
                    </FormLabel>
                    <FormControl>
                      <div
                        className={cn(
                          "border border-dashed border-zinc-700 rounded-lg w-full max-w-[240px] h-[240px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden mx-auto",
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
                              alt="Uploaded logo"
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
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
                      Upload a logo image for your collection
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="externalLink"
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

              <Button
                type="submit"
                disabled={!form.formState.isValid || isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Collection...
                  </>
                ) : (
                  "Create Collection"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

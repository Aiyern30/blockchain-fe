/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Information from "@/components/page/Drop/Information";
import { Loader2, Upload, Info } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { useWalletClient } from "wagmi";

import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import { cn } from "@/lib/utils";
import type { StagingStatus } from "@/type/stagingStatus";
import NFTMintingUI from "@/components/page/Drop/NFTMintingUI";
import { uploadToIPFS } from "@/utils/uploadIPFS";
import { STATUS_STAGES } from "@/type/StatusStages";
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
  const [showInfoMobile, setShowInfoMobile] = useState(false);

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

  const handleRetry = () => {
    setShowMintingUI(false);
    setMintingStatus("idle");
    setTxHash(null);
  };

  if (showMintingUI) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <NFTMintingUI
            status={mintingStatus}
            txHash={txHash}
            onRetry={handleRetry}
            openConnectModal={openConnectModal}
          />
        )}
      </ConnectButton.Custom>
    );
  }

  const toggleMobileInfo = () => {
    setShowInfoMobile(!showInfoMobile);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Mobile Info Toggle Button */}
      <div className="lg:hidden mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileInfo}
          className="flex items-center gap-2"
        >
          <Info className="h-4 w-4" />
          {showInfoMobile ? "Hide" : "Show"} Info
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="border border-zinc-800 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-zinc-900 to-zinc-800 py-8 text-center border-b border-zinc-700">
              <CardTitle className="text-2xl md:text-3xl font-bold text-white">
                Create Collection
              </CardTitle>
              <CardDescription className="text-zinc-300">
                Fill in details about your NFT collection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 px-4 md:px-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">
                              Collection Name
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">
                                    The name will appear on marketplaces and
                                    your collection page
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="My Awesome Collection"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-zinc-400">
                            The name of your NFT collection
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">Symbol</FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">
                                    Usually 3-5 characters, used as an
                                    abbreviated identifier
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="MAC"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                              maxLength={10}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-zinc-400">
                            A short uppercase symbol (e.g., BTC, ETH)
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-base">
                            Description
                          </FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-60">
                                  Provide a detailed description to help
                                  collectors understand your collection
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your collection..."
                            className="resize-none min-h-[120px] "
                            {...field}
                          />
                        </FormControl>
                        <div className="flex justify-between">
                          <FormDescription className="text-xs text-zinc-400">
                            Detailed description of your collection
                          </FormDescription>
                          <span className="text-xs text-zinc-400">
                            {field.value.length}/1000
                          </span>
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel
                              className={cn(
                                "text-base",
                                form.formState.errors.image && "text-red-400"
                              )}
                            >
                              Logo Image
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">
                                    This image will be used as the collection
                                    logo on marketplaces
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <div
                              className={cn(
                                "border border-dashed border-zinc-700 rounded-lg w-full max-w-[240px] h-[240px] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden mx-auto",
                                "hover:border-zinc-500 hover:bg-zinc-800/50 transition-all duration-300"
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
                                <div className="relative w-full h-full group">
                                  <Image
                                    src={imageUrl || "/placeholder.svg"}
                                    alt="Uploaded logo"
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <p className="text-white text-sm font-medium">
                                      Change Image
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-center p-4">
                                  <Upload className="h-10 w-10 text-zinc-400 mb-4" />
                                  <p className="text-sm font-medium text-zinc-300">
                                    Drag and drop media
                                  </p>
                                  <p className="text-xs text-zinc-500 mt-2">
                                    Browse files
                                  </p>
                                  <p className="text-xs text-zinc-500 mt-2">
                                    Max size: 50MB
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    JPG, PNG, GIF, SVG, MP4
                                  </p>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-center text-xs text-zinc-400">
                            Upload a logo image for your collection
                          </FormDescription>
                          <FormMessage className="text-center text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="externalLink"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-base">
                              External Link (Optional)
                            </FormLabel>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-200 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="w-60">
                                    Link to your website, social media, or any
                                    other platform
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <Input
                              placeholder="https://your-website.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-zinc-400">
                            Link to your website or social media
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      type="submit"
                      disabled={!form.formState.isValid || isSubmitting}
                      className="w-full md:w-auto "
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Collection...
                        </>
                      ) : (
                        "Create Collection"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Information sidebar - hidden on mobile unless toggled */}
        <div
          className={cn(
            "space-y-6 transition-all",
            showInfoMobile ? "block" : "hidden lg:block"
          )}
        >
          <Information />
        </div>
      </div>
    </div>
  );
}

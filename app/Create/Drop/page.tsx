"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Info, Upload, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Input,
  Card,
  CardContent,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Button,
} from "@/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import Information from "./Information";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

type Blockchain = "ethereum" | "base" | null;

type FormValues = {
  contractName: string;
  tokenSymbol: string;
};

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function DropNFT() {
  const { toast } = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading] = useState(false);
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);
  const { address } = useAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }
  };

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const ipfsUrl = `https://ipfs.io/ipfs/${data.IpfsHash}`;
      setImageUrl(ipfsUrl);
      console.log("Image uploaded:", ipfsUrl);
    } catch (error) {
      console.error("Image upload error:", error);
    }
  };

  const formMethods = useForm<FormValues>({
    defaultValues: {
      contractName: "",
      tokenSymbol: "",
    },
  });

  const { handleSubmit, control } = formMethods;

  const onSubmit = async (data: FormValues) => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please upload an image first!",
        variant: "destructive",
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Wallet address not found!",
        variant: "destructive",
      });
      return;
    }

    const metadata = {
      name: data.contractName,
      symbol: data.tokenSymbol,
      image: imageUrl,
      blockchain: selectedBlockchain,
      owner: walletAddress,
    };

    console.log("Submitting metadata:", metadata);

    try {
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataBlob, "metadata.json");

      const metadataResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
          },
          body: metadataFormData,
        }
      );

      if (!metadataResponse.ok) throw new Error("Metadata upload failed");

      const metadataData = await metadataResponse.json();
      const metadataUrl = `https://ipfs.io/ipfs/${metadataData.IpfsHash}`;

      console.log("Metadata successfully uploaded:", metadataUrl);

      toast({
        title: "Success",
        description: "NFT Metadata uploaded successfully!",
      });

      // ✅ Clear the form and reset image state
      formMethods.reset();
      setImageUrl(null);
      setSelectedBlockchain(null);
    } catch (error) {
      console.error("Error uploading metadata:", error);
      toast({
        title: "Error",
        description: "Failed to upload NFT metadata.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Let&apos;s create a smart contract for your drop.
            </h1>
            <p className="text-muted-foreground">
              You&apos;ll need to deploy an ERC-721 contract onto the blockchain
              before you can create a drop.{" "}
              <a href="#" className="text-primary hover:underline">
                What is a contract?
              </a>
            </p>
          </div>
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FormLabel>Logo Image</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Your collection&apos;s logo image
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div
                    className={cn(
                      "border rounded-lg aspect-[350/200] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
                      "hover:bg-muted/50 transition-colors",
                      dragActive && "border-primary bg-muted/50"
                    )}
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileInput}
                    />

                    {imageUrl ? (
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt="Uploaded logo"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">
                          {uploading
                            ? "Uploading..."
                            : "Drag and drop or click to upload"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You may change this after deploying your contract.
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Recommended size: 350 x 350. File types: JPG, PNG,
                          SVG, or GIF
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="contractName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contract Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Collection Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="tokenSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token Symbol</FormLabel>
                        <FormControl>
                          <Input placeholder="MCN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <label className="font-medium">Blockchain</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            A blockchain is a digitally distributed ledger that
                            records transactions and information across a
                            decentralized network. There are different types of
                            blockchains, which you can choose to drop on.
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            You cannot change the blockchain once you deploy
                            your contract.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card
                      className={cn(
                        "relative cursor-pointer transition-colors hover:border-primary",
                        selectedBlockchain === "ethereum" &&
                          "border-primary bg-muted/50"
                      )}
                      onClick={() => setSelectedBlockchain("ethereum")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="rounded-full overflow-hidden">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nYlEWWzFKtOY9epUSVbiAOpm3PmO5w.png"
                              alt="Ethereum"
                              width={32}
                              height={32}
                              className="bg-[#627EEA] p-1"
                            />
                          </div>
                          <span className="font-medium">Ethereum</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Most popular
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Estimated cost to deploy contract:
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={cn(
                        "relative cursor-pointer transition-colors hover:border-primary",
                        selectedBlockchain === "base" &&
                          "border-primary bg-muted/50"
                      )}
                      onClick={() => setSelectedBlockchain("base")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="rounded-full overflow-hidden bg-white">
                            <Image
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nYlEWWzFKtOY9epUSVbiAOpm3PmO5w.png"
                              alt="Base"
                              width={32}
                              height={32}
                            />
                          </div>
                          <span className="font-medium">Base</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Cheaper
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Estimated cost to deploy contract: $0.00
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-primary">
                      <CardContent className="p-4 h-full flex flex-col justify-center items-center text-muted-foreground">
                        <MoreHorizontal className="h-6 w-6 mb-2" />
                        <span className="font-medium">See more options</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <Button variant={"default"} type="submit" className="btn-primary">
                Deploy Contract
              </Button>
            </form>
          </FormProvider>
        </div>
        <div className="space-y-6">
          <Information />
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Ban, Info, Upload } from "lucide-react";
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
  Textarea,
} from "@/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import Information from "../../../components/page/Explore/Create/Drop/Information";
import { useAccount } from "wagmi";
// import { useToast } from "@/hooks/use-toast";
import { getERC721Contract } from "@/lib/erc721Config";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import NFTMintingUI from "../../../components/page/Explore/Create/Drop/NFTMintingUI";
import { StagingStatus } from "@/type/stagingStatus";
import { checkNFTExists } from "@/utils/checkNFTExists";
type Blockchain = "ethereum" | "base" | null;

type FormValues = {
  contractName: string;
  tokenSymbol: string;
  contractDescription: string;
  logoImage: File | string | null;
  maxSupply: number;
  price: number;
  status: "PUBLIC" | "PRIVATE";
};

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function DropNFT() {
  // const { toast } = useToast();
  const { data: walletClient } = useWalletClient();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);
  const { address } = useAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [stagingStatus, setStagingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setValue("logoImage", null);
        return;
      }

      setValue("logoImage", file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const formMethods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      contractName: "",
      tokenSymbol: "",
      contractDescription: "",
      logoImage: null,
      maxSupply: 0,
      price: 0,
      status: "PUBLIC",
    },
  });

  const { handleSubmit, control, setValue, watch, reset, formState } =
    formMethods;
  const { errors } = formState;
  const selectedFile = watch("logoImage");

  const onSubmit = async (data: FormValues) => {
    if (!selectedFile || !walletClient || !walletAddress) {
      alert("Please complete all fields and connect your wallet!");
      return;
    }

    try {
      setStagingStatus("checking");

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      // ✅ Check if NFT already exists
      const latestTokenId = await nftContract.totalSupply();
      const tokenId = Number(latestTokenId.toString()) + 1;

      const exists = await checkNFTExists(provider, tokenId, "");
      if (exists) {
        setStagingStatus("exists");
        alert("This NFT has already been minted!");
        return;
      }

      // ✅ Upload Image to IPFS
      setStagingStatus("uploading");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const imageResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${PINATA_JWT}` },
          body: formData,
        }
      );

      if (!imageResponse.ok) throw new Error("Image upload failed");
      const imageData = await imageResponse.json();
      const imageUrl = `https://ipfs.io/ipfs/${imageData.IpfsHash}`;

      // ✅ Upload Metadata to IPFS
      const metadata = {
        name: data.contractName,
        symbol: data.tokenSymbol,
        image: imageUrl,
        blockchain: "ethereum",
        owner: walletClient.account.address,
      };

      const metadataFile = new File(
        [JSON.stringify(metadata)],
        "metadata.json",
        { type: "application/json" }
      );

      const metadataFormData = new FormData();
      metadataFormData.append("file", metadataFile);

      const metadataResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${PINATA_JWT}` },
          body: metadataFormData,
        }
      );

      if (!metadataResponse.ok) throw new Error("Metadata upload failed");
      const metadataData = await metadataResponse.json();
      const metadataUrl = `https://ipfs.io/ipfs/${metadataData.IpfsHash}`;

      const finalExists = await checkNFTExists(provider, tokenId, metadataUrl);
      if (finalExists) {
        setStagingStatus("exists");
        alert("This NFT has already been minted!");
        return;
      }

      // ✅ Mint NFT
      setStagingStatus("minting");

      const mintTx = await nftContract.mintNFT(
        walletClient.account.address,
        metadataUrl
      );
      setTxHash(mintTx.hash);
      await mintTx.wait();
      alert("NFT successfully minted!");
      setStagingStatus("done");
    } catch (error: unknown) {
      console.error("Error:", error);

      const err = error as { code?: number; message?: string };

      if (
        err?.code === 4001 ||
        err?.message?.includes("User denied transaction signature")
      ) {
        console.warn("User rejected the transaction.");
        alert("Minting cancelled by user.");
        setStagingStatus("cancelled");
        return;
      }

      alert("Something went wrong!");
      setStagingStatus("error");
    }
  };

  return (
    <>
      {stagingStatus !== "idle" ? (
        <NFTMintingUI
          status={stagingStatus}
          txHash={txHash}
          walletAddress={walletAddress}
          onRetry={() => {
            reset();
            setStagingStatus("idle");
            setImageUrl(null);
          }}
        />
      ) : (
        <div className="min-h-screen bg-background p-6">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr,320px]">
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Let&apos;s create a smart contract for your drop.
                </h1>
                <p className="text-muted-foreground">
                  You&apos;ll need to deploy an ERC-721 contract onto the
                  blockchain before you can create a drop.{" "}
                  <a href="#" className="text-primary hover:underline">
                    What is a contract?
                  </a>
                </p>
              </div>
              <FormProvider {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <FormField
                      control={control}
                      name="logoImage"
                      rules={{
                        required: "Logo image is required",
                        validate: (file) =>
                          file instanceof File && file.size <= MAX_FILE_SIZE
                            ? true
                            : "File size exceeds 10MB",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(errors.logoImage && "text-red-500")}
                          >
                            Logo Image
                          </FormLabel>

                          <FormControl>
                            <div
                              className={cn(
                                "border rounded-lg aspect-[350/200] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
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
                                  const file = e.target.files?.[0] || null;
                                  handleFileInput(e);
                                  field.onChange(file); // Set the selected file in RHF state
                                }}
                              />

                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt="Uploaded logo"
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              ) : (
                                <>
                                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                  <p className="text-sm font-medium">
                                    Drag and drop or click to upload
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-4">
                                    Recommended size: 350 x 350. File types:
                                    JPG, PNG, SVG, or GIF
                                  </p>
                                </>
                              )}
                            </div>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={control}
                        name="contractName"
                        rules={{ required: "Contract name is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="My Collection Name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="tokenSymbol"
                        rules={{ required: "Token symbol is required" }}
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
                    <div className="grid grid-cols-1">
                      <FormField
                        control={control}
                        name="contractDescription"
                        rules={{
                          required: "Contract description is required",
                          maxLength: {
                            value: 500,
                            message:
                              "Description must be 500 characters or less",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter NFT description (Max 500 chars)"
                                {...field}
                                maxLength={500}
                                className="resize-none h-32 overflow-hidden"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={control}
                        name="price"
                        rules={{ required: "Listed Price is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listed Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="My Listed Price"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="maxSupply"
                        rules={{ required: "Maximum Supply is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Supply</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Maximum Supply"
                                {...field}
                              />
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
                                A blockchain is a digitally distributed ledger
                                that records transactions and information across
                                a decentralized network. There are different
                                types of blockchains, which you can choose to
                                drop on.
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
                                  src="https://opensea.io/static/images/logos/ethereum.svg"
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

                        {/* <Card
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
                    </Card> */}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="default"
                    type="submit"
                    className={cn(
                      "mt-2 flex items-center gap-2",
                      !formState.isValid && "cursor-not-allowed opacity-50"
                    )}
                    disabled={!formState.isValid}
                  >
                    {!formState.isValid && (
                      <Ban className="w-4 h-4 text-red-500" />
                    )}
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
      )}
    </>
  );
}

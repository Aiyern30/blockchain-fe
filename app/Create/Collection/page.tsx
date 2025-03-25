/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { Upload, Ban, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Button,
  Textarea,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogTrigger,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DeployCollectionForm from "@/components/deployCollectionForm";
import { useAccount, useWalletClient } from "wagmi";
import { StagingStatus } from "@/type/stagingStatus";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";
import NFTMintingUI from "@/components/page/Explore/Create/Drop/NFTMintingUI";

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function CreateNFT() {
  type ContractFormValues = {
    contractName: string;
    supply: number;
    contractDescription: string;
    logoImage: File | string | null;
    status: "PUBLIC" | "PRIVATE";
    traits: { type: string; name: string }[];
    externalLink?: string;
  };

  type FormValues = {
    collectionName: string;
    tokenSymbol: string;
    collectionDescription: string;
    collectionImage: File | string | null;
  };

  const formMethods = useForm<ContractFormValues>({
    mode: "onChange",
    defaultValues: {
      contractName: "",
      supply: 0,
      contractDescription: "",
      logoImage: null,
      status: "PUBLIC",
      traits: [],
      externalLink: "",
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    watch,
    formState,
  } = formMethods;
  const { errors, isValid } = formState;
  const selectedFile = watch("logoImage");
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [stagingStatus, setStagingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string[] | null>(null);
  // Use a local state to track traits to avoid re-render issues
  const [traits, setTraits] = useState<{ type: string; name: string }[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isTraitDialogOpen, setTraitDialogOpen] = useState(false);
  const [traitType, setTraitType] = useState("");
  const [traitName, setTraitName] = useState("");
  const [collectionData, setCollectionData] = useState<{
    name: string;
    description: string;
    image: string;
    cid: string;
  } | null>(null);

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const addTrait = () => {
    if (traitType && traitName) {
      const newTraits = [...traits, { type: traitType, name: traitName }];
      setTraits(newTraits);

      setValue("traits", newTraits, { shouldValidate: true });

      setTraitType("");
      setTraitName("");
      setTraitDialogOpen(false);
    }
  };

  const removeTrait = (index: number) => {
    const newTraits = traits.filter((_, i) => i !== index);
    setTraits(newTraits);

    setValue("traits", newTraits, { shouldValidate: true });
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setValue("logoImage", null);
        toast.error("File size exceeds 50MB!");
        return;
      }

      setValue("logoImage", file, { shouldValidate: true });
      setImageUrl(URL.createObjectURL(file));
    }
  };
  const fetchCollectionData = async (cid: string) => {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!response.ok) throw new Error("Failed to fetch collection metadata");

      const metadata = await response.json();
      console.log("Fetched Collection Metadata:", metadata);

      setCollectionData({
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        cid,
      });
    } catch (error) {
      console.error("Error fetching collection data:", error);
    }
  };

  const handleContractSubmit = (
    ContractData: FormValues & { collectionCID: string }
  ) => {
    console.log("Deployed Contract:", ContractData);

    fetchCollectionData(ContractData.collectionCID);
  };

  const onSubmit = async (data: ContractFormValues) => {
    if (!walletClient || !walletAddress) {
      toast.warning("Please complete all fields and connect your wallet!", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
      return;
    }

    try {
      console.log("🚀 Starting minting process...");
      setStagingStatus("checking");

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      console.log("✅ Connected to contract:", await nftContract.getAddress());
      console.log("👤 Wallet address:", walletClient.account.address);

      setStagingStatus("uploading");

      /** =======================
       * Upload Collection Image
       * ======================== */
      if (!data.logoImage || typeof data.logoImage === "string") {
        throw new Error("❌ Invalid NFT image file");
      }

      console.log("📤 Uploading collection image...");
      const collectionImageUrl = await uploadToIPFS(data.logoImage);
      console.log("✅ Collection image uploaded:", collectionImageUrl);

      /** =======================
       * Upload Collection Metadata
       * ======================== */
      console.log("📤 Uploading collection metadata...");
      const collectionMetadata = {
        name: data.contractName,
        description: data.contractDescription,
        image: collectionImageUrl,
        external_url: data.externalLink,
        supply: Number(data.supply),
        blockchain: "ethereum",
        owner: walletClient.account.address,
      };

      const collectionMetadataCID = await uploadJSONToIPFS(collectionMetadata);
      console.log("✅ Collection metadata uploaded:", collectionMetadataCID);

      /** =======================
       * Upload NFT Image ONCE
       * ======================== */
      console.log("📤 Uploading NFT image...");
      const nftImageUrl = await uploadToIPFS(data.logoImage);
      console.log("✅ NFT image uploaded:", nftImageUrl);

      /** =======================
       * Upload Metadata for Each NFT
       * ======================== */
      console.log("📤 Uploading metadata for", data.supply, "NFTs...");
      const tokenURIs: string[] = [];

      for (let i = 0; i < Number(data.supply); i++) {
        const metadata = {
          name: `${data.contractName} #${i + 1}`,
          description: data.contractDescription,
          image: nftImageUrl,
          external_url: data.externalLink,
          attributes: data.traits,
          collectionCID: collectionMetadataCID,
        };

        const metadataCID = await uploadJSONToIPFS(metadata);
        const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;
        console.log(`✅ Metadata for NFT #${i + 1} uploaded:`, tokenURI);
        tokenURIs.push(tokenURI);
      }

      if (tokenURIs.length === 0) {
        throw new Error("❌ No token URIs found. Minting aborted.");
      }

      /** =======================
       * Estimate Gas & Mint NFTs
       * ======================== */
      setStagingStatus("minting");

      const mintCost = BigInt(100) * BigInt(tokenURIs.length);
      console.log("💰 Minting fee required:", mintCost.toString());

      let gasLimit = ethers.parseUnits("5000000", "wei"); // 5M gas
      try {
        const gasEstimate = await nftContract.mintMultipleNFTs.estimateGas(
          walletClient.account.address,
          tokenURIs,
          { value: mintCost }
        );
        gasLimit = gasEstimate + BigInt(100000);
      } catch (err) {
        console.warn("⚠️ Gas estimation failed:", err);
        gasLimit = ethers.parseUnits("300000", "wei");
      }

      console.log("⛽ Gas limit set:", gasLimit.toString());

      console.log("🚀 Sending mint transaction...");
      const tx = await nftContract.mintMultipleNFTs(
        walletClient.account.address,
        tokenURIs,
        { value: mintCost, gasLimit: gasLimit }
      );

      if (!tx || !tx.hash) {
        throw new Error("❌ Transaction failed to send.");
      }

      console.log("✅ Transaction sent! Waiting for confirmation...", tx.hash);
      await tx.wait();
      console.log("🎉 NFTs minted successfully!", tx.hash);
      setTxHash([tx.hash]);
      setStagingStatus("done");
    } catch (error: unknown) {
      console.error("❌ Error:", error);
      setStagingStatus("error");
    }
  };

  /** =======================
   * Helper Functions to Upload to IPFS
   * ======================== */
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

  const uploadJSONToIPFS = async (json: any): Promise<string> => {
    const jsonFile = new File([JSON.stringify(json)], "metadata.json", {
      type: "application/json",
    });
    return await uploadToIPFS(jsonFile);
  };

  return (
    <>
      {stagingStatus !== "idle" ? (
        <NFTMintingUI
          status={stagingStatus}
          txHash={txHash}
          walletAddress={walletAddress}
          onRetry={() => {
            reset({
              contractName: "",
              supply: 0,
              contractDescription: "",
              logoImage: null,
              status: "PUBLIC",
              traits: [],
              externalLink: "",
            });
            setStagingStatus("idle");
          }}
        />
      ) : (
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="mb-6">
            <CardTitle>Create an NFT</CardTitle>
            <CardDescription>
              Once your item is minted you will not be able to change any of its
              information.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FormProvider {...formMethods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid lg:grid-cols-2 gap-8"
              >
                <div>
                  <FormField
                    control={control}
                    name="logoImage"
                    rules={{
                      required: "A logo image is required!",
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
                              "border border-dashed border-zinc-700 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
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
                                field.onChange(e.target.files?.[0] || null);
                              }}
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
                              <div className="flex flex-col items-center justify-center text-center p-6">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">
                                  Drag and drop media
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                  Browse files
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Max size: 50MB
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  JPG, PNG, GIF, SVG, MP4
                                </p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  {!collectionData ? (
                    <div className="space-y-2">
                      <Label className="flex items-center">
                        Collection
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Dialog>
                        <DialogTrigger className="w-full justify-start text-left rounded-xl">
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left "
                          >
                            <span className="mr-2">+</span>
                            Create a new collection
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DeployCollectionForm
                            onSubmit={handleContractSubmit}
                          />
                        </DialogContent>
                      </Dialog>

                      <p className="text-sm text-zinc-400">
                        Not all collections are eligible.{" "}
                        <Link
                          href="#"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Learn more
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl flex space-x-4 items-center">
                      <Image
                        src={
                          collectionData.image ||
                          "https://via.placeholder.com/100"
                        }
                        alt="Collection Image"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover"
                        unoptimized
                      />
                      <div>
                        <h3 className="text-lg font-semibold">
                          {collectionData.name || "Unnamed Collection"}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {collectionData.description ||
                            "No description available."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="contractName"
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Name
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Name your NFT" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="supply"
                      rules={{ required: "Supply is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Supply
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="contractDescription"
                      rules={{
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters",
                        },
                        maxLength: {
                          value: 500,
                          message: "Description must be 500 characters or less",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Description
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter a description"
                              {...field}
                              className="resize-none h-32"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <FormMessage />
                            <span>{field.value?.length || 0}/500</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="externalLink"
                      rules={{
                        pattern: {
                          value:
                            /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                          message: "Please enter a valid URL",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External link</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://collection.io/item/123"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={control}
                      name="traits"
                      rules={{
                        validate: () => {
                          const currentTraits = getValues("traits");
                          if (!currentTraits || currentTraits.length === 0) {
                            return "At least one trait is required";
                          }
                          return true;
                        },
                      }}
                      render={() => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>
                              Traits
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                          </div>
                          <FormControl>
                            <div className="space-y-2">
                              <p className="text-sm text-zinc-400">
                                Traits describe attributes of your item. They
                                appear as filters inside your collection page
                                and are also listed out inside your item page.
                              </p>

                              <div className="space-y-2 mt-2">
                                {traits.length > 0 ? (
                                  traits.map((trait, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center border border-zinc-700 p-2 rounded-lg"
                                    >
                                      <div className="flex items-center justify-center gap-5">
                                        <div>{trait.type}</div>:
                                        <div>{trait.name}</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTrait(index)}
                                      >
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-zinc-500 italic">
                                    No traits added yet
                                  </div>
                                )}
                              </div>

                              <Dialog
                                open={isTraitDialogOpen}
                                onOpenChange={setTraitDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full mt-2"
                                  >
                                    <Plus className="mr-2" /> Add Trait
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Trait</DialogTitle>
                                    <DialogDescription>
                                      Specify the type and name of the trait.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Input
                                    placeholder="Trait Type (e.g., Background)"
                                    value={traitType}
                                    onChange={(e) =>
                                      setTraitType(e.target.value)
                                    }
                                    className="mb-4"
                                  />
                                  <Input
                                    placeholder="Trait Name (e.g., Red)"
                                    value={traitName}
                                    onChange={(e) =>
                                      setTraitName(e.target.value)
                                    }
                                    className="mb-4"
                                  />
                                  <Button
                                    onClick={addTrait}
                                    disabled={!traitType || !traitName}
                                  >
                                    Add Trait
                                  </Button>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    variant="default"
                    type="submit"
                    className={cn(
                      "mt-6 w-full",
                      (!isValid ||
                        !selectedFile ||
                        traits.length === 0 ||
                        !collectionData) &&
                        "cursor-not-allowed opacity-50"
                    )}
                    disabled={
                      !isValid ||
                      !selectedFile ||
                      traits.length === 0 ||
                      !collectionData
                    }
                  >
                    {(!isValid ||
                      !selectedFile ||
                      traits.length === 0 ||
                      !collectionData) && (
                      <Ban className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    Deploy Contract
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}
    </>
  );
}

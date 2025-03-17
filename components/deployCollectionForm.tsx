import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/";
import Image from "next/image";
import { Upload, Ban, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { StagingStatus } from "@/type/stagingStatus";
import { getERC721Contract } from "@/lib/erc721Config";
import { ethers } from "ethers";
import NFTMintingUI from "./page/Explore/Create/Drop/NFTMintingUI";

type FormValues = {
  contractName: string;
  tokenSymbol: string;
  contractDescription: string;
  logoImage: File | string | null;
  status: "PUBLIC" | "PRIVATE";
};
type Blockchain = "ethereum" | "base" | null;
interface DeployCollectionForm {
  onSubmit: (data: FormValues & { collectionCID: string }) => void;
}

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function DeployCollectionForm({
  onSubmit,
}: DeployCollectionForm) {
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [stagingStatus, setStagingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string[] | null>(null);

  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);

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

  const formMethods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      contractName: "",
      tokenSymbol: "",
      contractDescription: "",
      logoImage: null,
      status: "PUBLIC",
    },
  });
  const { reset } = formMethods;

  const { handleSubmit, control, setValue, watch, formState } = formMethods;
  const { errors, isValid } = formState;
  const selectedFile = watch("logoImage");

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const mintCollection = async (data: FormValues) => {
    if (!walletClient || !walletAddress) {
      toast.error("Please connect your wallet and fill all fields!");
      return;
    }

    try {
      console.log("Wallet connected:", walletAddress);
      setStagingStatus("checking");

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      console.log("Signer Address:", await signer.getAddress());

      const nftContract = getERC721Contract(signer);
      console.log("NFT Contract Instance:", nftContract);

      const collectionExists = await nftContract.userCollections(walletAddress);
      console.log("Current Collection Data:", collectionExists);

      if (collectionExists.name) {
        throw new Error("Collection already exists. Cannot mint again.");
      }

      const contractOwner = await nftContract.owner();
      const currentWallet = await signer.getAddress();
      console.log("Contract Owner:", contractOwner);
      console.log("Your Wallet Address:", currentWallet);

      setStagingStatus("uploading");

      let collectionImageUrl = "";

      if (data.logoImage && typeof data.logoImage !== "string") {
        console.log("Uploading collection image to IPFS...");
        const formData = new FormData();
        formData.append("file", data.logoImage);

        const imageResponse = await fetch(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${PINATA_JWT}` },
            body: formData,
          }
        );

        if (!imageResponse.ok)
          throw new Error("Collection image upload failed");
        const imageData = await imageResponse.json();
        collectionImageUrl = `https://ipfs.io/ipfs/${imageData.IpfsHash}`;
        console.log("Collection image URL:", collectionImageUrl);
      }

      console.log("Creating metadata...");
      const collectionMetadata = {
        name: data.contractName,
        description: data.contractDescription,
        image: collectionImageUrl,
      };
      console.log("Collection Metadata:", collectionMetadata);

      const collectionMetadataFile = new File(
        [JSON.stringify(collectionMetadata)],
        `${data.contractName}.json`,
        { type: "application/json" }
      );

      const metadataFormData = new FormData();
      metadataFormData.append("file", collectionMetadataFile);

      console.log("Uploading metadata to IPFS...");
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
      const collectionCID = metadataData.IpfsHash;
      console.log("Collection CID:", collectionCID);

      setStagingStatus("minting");

      console.log("Minting collection with parameters:");
      console.log("Name:", data.contractName);
      console.log("Description:", data.contractDescription);
      console.log("Image URL:", collectionImageUrl);
      console.log("Metadata CID:", collectionCID);
      console.log("Sender Address:", await signer.getAddress());
      console.log("Contract Address:", nftContract.target);

      const tx = await nftContract.mintCollection(
        data.contractName,
        data.contractDescription,
        collectionImageUrl,
        collectionCID,
        { gasLimit: 5000000 }
      );

      console.log("Transaction Sent:", tx);
      console.log("Transaction Hash:", tx.hash);

      await tx.wait();
      console.log("Transaction Mined! Receipt:", tx);

      setTxHash([tx.hash]);
      setStagingStatus("done");

      onSubmit({ ...data, collectionCID: collectionCID });

      return collectionCID;
    } catch (error: unknown) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Transaction failed"
      );
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
          }}
        />
      ) : (
        <Card className="space-y-8 bg-background">
          <CardHeader>
            <CardTitle>
              First, you need to create a collection for your NFT.
            </CardTitle>
            <CardDescription>
              You&apos;ll need to deploy an ERC-721 contract onto the blockchain
              to create a collection for your NFT.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(mintCollection)}>
                <div className="space-y-6">
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
                              "border rounded-lg aspect-[350/200] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden",
                              "hover:bg-muted/50 transition-colors"
                            )}
                            onClick={() =>
                              document
                                .getElementById("dialog-file-input")
                                ?.click()
                            }
                          >
                            <input
                              id="dialog-file-input"
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
                              <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">
                                  Drag and drop or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground mt-4">
                                  Recommended size: 350 x 350. File types: JPG,
                                  PNG, SVG, or GIF
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
                          message: "Description must be 500 characters or less",
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
                              that records transactions and information across a
                              decentralized network. There are different types
                              of blockchains, which you can choose to drop on.
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
                    </div>
                  </div>
                </div>

                <Button
                  variant="default"
                  type="submit"
                  className={cn(
                    "mt-2 flex items-center gap-2",
                    (!isValid || !selectedFile) &&
                      "cursor-not-allowed opacity-50"
                  )}
                  disabled={!isValid || !selectedFile}
                >
                  {(!isValid || !selectedFile) && (
                    <Ban className="w-4 h-4 text-red-500" />
                  )}
                  Deploy Contract
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}
    </>
  );
}

"use client";

import type React from "react";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import Information from "../../../components/page/Explore/Create/Drop/Information";
import { useAccount } from "wagmi";
import { getERC721Contract } from "@/lib/erc721Config";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import NFTMintingUI from "../../../components/page/Explore/Create/Drop/NFTMintingUI";
import type { StagingStatus } from "@/type/stagingStatus";
import { toast } from "sonner";
import DeployContractForm from "@/components/DeployContractForm";

type FormValues = {
  collectionName: string;
  contractName: string;
  collectionDescription: string;
  tokenSymbol: string;
  contractDescription: string;
  logoImage: File | string | null;
  maxSupply: number;
  price: number;
  status: "PUBLIC" | "PRIVATE";
};

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export default function DropNFT() {
  const { data: walletClient } = useWalletClient();

  const { address } = useAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [stagingStatus, setStagingStatus] = useState<StagingStatus>("idle");
  const [txHash, setTxHash] = useState<string[] | null>(null);

  useEffect(() => {
    if (address) {
      setWalletAddress(address);
    }
  }, [address]);

  const formMethods = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      collectionName: "",
      collectionDescription: "",
      contractName: "",
      tokenSymbol: "",
      contractDescription: "",
      logoImage: null,
      maxSupply: 0,
      price: 0,
      status: "PUBLIC",
    },
  });

  const { reset } = formMethods;

  const onSubmit = async (data: FormValues) => {
    if (!walletClient || !walletAddress) {
      toast.warning("Please complete all fields and connect your wallet!", {
        style: {
          backgroundColor: "#f59e0b",
          color: "white",
        },
      });
      return;
    }

    try {
      setStagingStatus("checking");

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      const maxSupply = Number(data.maxSupply);

      setStagingStatus("uploading");

      let collectionImageUrl = "";
      if (data.logoImage && typeof data.logoImage !== "string") {
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
      }

      const collectionMetadata = {
        name: data.collectionName,
        description: data.collectionDescription,
        image: collectionImageUrl,
        blockchain: "ethereum",
        owner: walletClient.account.address,
      };

      const collectionMetadataFile = new File(
        [JSON.stringify(collectionMetadata)],
        `${data.collectionName}-metadata.json`,
        { type: "application/json" }
      );

      const collectionFormData = new FormData();
      collectionFormData.append("file", collectionMetadataFile);

      const collectionResponse = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${PINATA_JWT}` },
          body: collectionFormData,
        }
      );

      if (!collectionResponse.ok) throw new Error("Collection upload failed");
      const collectionData = await collectionResponse.json();
      const collectionMetadataUrl = `https://ipfs.io/ipfs/${collectionData.IpfsHash}`;

      setStagingStatus("uploading");
      const tokenURIs: string[] = [];

      for (let i = 0; i < maxSupply; i++) {
        const formData = new FormData();
        formData.append("file", data.logoImage as File);

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

        const metadata = {
          name: `${data.contractName} #${i + 1}`,
          description: `${data.contractDescription}`,
          image: imageUrl,
          attributes: [{ trait_type: "Price", value: data.price }],
          collection: collectionMetadataUrl,
        };

        const metadataFile = new File(
          [JSON.stringify(metadata)],
          `${data.contractName}-${i + 1}.json`,
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

        tokenURIs.push(metadataUrl);
      }

      setStagingStatus("minting");
      const mintTx = await nftContract.mintMultipleNFTs(
        walletClient.account.address,
        tokenURIs,
        {
          value: ethers.parseEther("0.01") * BigInt(maxSupply),
        }
      );

      await mintTx.wait();

      console.log("NFTs minted successfully!", mintTx.hash);

      setTxHash([mintTx.hash]);
      setStagingStatus("done");
    } catch (error: unknown) {
      console.error("Error:", error);

      const err = error as { code?: number; message?: string };

      if (
        err?.code === 4001 ||
        err?.message?.includes("User denied transaction signature")
      ) {
        console.warn("User rejected the transaction.");
        setStagingStatus("cancelled");
        return;
      }

      setStagingStatus("error");
    }
  };

  return (
    <>
      {stagingStatus !== "idle" ? (
        <NFTMintingUI
          status={stagingStatus}
          txHash={txHash}
          onRetry={() => {
            reset();
            setStagingStatus("idle");
          }}
        />
      ) : (
        <div className="min-h-screen p-6">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr,320px]">
            <DeployContractForm onSubmit={onSubmit} />
            <div className="hidden lg:block">
              <div className="space-y-6 self-start sticky top-6 h-fit">
                <Information />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

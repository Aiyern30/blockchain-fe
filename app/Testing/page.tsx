/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { getERC721Contract } from "@/lib/erc721Config";

export default function MintNFTForm() {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const uploadToIPFS = async (): Promise<string> => {
    const formData = new FormData();
    if (!image) throw new Error("No image selected");

    formData.append("file", image);

    const metadata = JSON.stringify({
      name,
      keyvalues: {
        description,
      },
    });

    formData.append("pinataMetadata", metadata);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
        },
      }
    );

    const ipfsHash = res.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  };

  const createMetadataAndUpload = async (imageUrl: string): Promise<string> => {
    const metadata = {
      name,
      description,
      image: imageUrl,
    };

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
        },
      }
    );

    const ipfsHash = res.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  };

  const mintNFT = async () => {
    setIsLoading(true);
    try {
      setStatus("Uploading image to IPFS...");
      const imageUrl = await uploadToIPFS();

      setStatus("Creating metadata...");
      const metadataUrl = await createMetadataAndUpload(imageUrl);

      setStatus("Minting NFT...");
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = getERC721Contract(signer);

      const priceInEther = ethers.parseEther(price);
      const listingFee = ethers.parseEther("0.0015");

      const tx = await marketplace.createToken(metadataUrl, priceInEther, {
        value: listingFee,
      });

      await tx.wait();
      setStatus("✅ NFT Minted and Listed!");
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Mint NFT</h1>
      <input type="file" onChange={handleImageChange} />
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 border"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Description"
        className="w-full p-2 border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Price (in ETH)"
        className="w-full p-2 border"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button
        onClick={mintNFT}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Processing..." : "Mint NFT"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}

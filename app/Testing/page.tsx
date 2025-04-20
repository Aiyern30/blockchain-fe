/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { getERC721Contract } from "@/lib/erc721Config";

export default function MintNFTForm() {
  const [images, setImages] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [symbol, setSymbol] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const uploadToIPFS = async (image: File): Promise<string> => {
    const formData = new FormData();

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

  const createCollection = async () => {
    console.log("Triggered createCollection");

    if (images.length === 0) {
      setStatus("Please select an image for your collection.");
      console.log("No image selected");
      return;
    }

    if (!name || !symbol || !description || !externalLink) {
      setStatus("Please fill in all fields.");
      console.log("Missing required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      await window.ethereum.request({ method: "eth_requestAccounts" });
      console.log("MetaMask connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("Signer fetched");

      const contract = getERC721Contract(signer);
      console.log("Contract loaded");

      // Upload to IPFS
      setStatus("Uploading collection image to IPFS...");
      const imageUrl = await uploadToIPFS(images[0]);
      console.log("IPFS upload done:", imageUrl);

      // Call smart contract
      setStatus("Creating collection on blockchain...");
      const tx = await contract.createCollection(
        name,
        symbol,
        description,
        imageUrl,
        externalLink
      );
      console.log("Transaction sent:", tx);

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      const collectionAddress = receipt.logs?.[0]?.address;
      setStatus(`✅ Collection created at ${collectionAddress}`);
    } catch (err: any) {
      console.error("Error in createCollection:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Create NFT Collection</h1>

      <input type="file" multiple onChange={handleImageChange} />

      <input
        type="text"
        placeholder="Collection Name"
        className="w-full p-2 border"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Symbol (e.g., COL)"
        className="w-full p-2 border"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />

      <textarea
        placeholder="Description"
        className="w-full p-2 border"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="External Link (e.g., https://example.com)"
        className="w-full p-2 border"
        value={externalLink}
        onChange={(e) => setExternalLink(e.target.value)}
      />

      <button
        onClick={createCollection}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? "Processing..." : "Create Collection"}
      </button>

      {status && <p className="text-sm text-gray-700 mt-2">{status}</p>}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
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

import { ImageUpload } from "./image-upload";
import { ethers } from "ethers";
import { getERC721Contract } from "@/lib/erc721Config";

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
  const { data: walletClient } = useWalletClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data: CollectionFormValues) => {
    if (!walletClient) {
      toast.warning("Please complete all fields and connect your wallet!", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
      return;
    }

    if (!data.image) {
      toast.warning("Image Required", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
      return;
    }

    try {
      console.log("📤 Uploading image to IPFS...");

      // Convert the blob URL to a File object
      const imageBlob = await fetch(data.image).then((res) => res.blob());
      const imageFile = new File([imageBlob], "collection_image.jpg", {
        type: imageBlob.type,
      });

      // Upload the image to IPFS
      const imageUrl = await uploadToIPFS(imageFile);

      console.log("✅ Image uploaded to IPFS:", imageUrl);

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const nftContract = getERC721Contract(signer);

      console.log("📜 Getting ERC721 contract...");
      console.log("✅ ERC721 contract ready:", nftContract.address);

      console.log("🚛 Preparing to call createCollection...");

      // Now call createCollection with IPFS image URL
      const tx = await nftContract.createCollection(
        data.name,
        data.symbol,
        data.description,
        imageUrl, // Use the IPFS image URL here
        data.externalLink || ""
      );

      const receipt = await tx.wait();
      console.log("🎯 Collection created:", receipt);

      toast.success("Collection Created!", {});
      form.reset(); // Reset the form after success
    } catch (error) {
      console.error("❌ Error creating collection:", error);
      toast.error("Failed to create collection. Please try again", {
        style: { backgroundColor: "#f59e0b", color: "white" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to upload image to IPFS
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
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`; // Return IPFS URL
  };

  return (
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
              <FormDescription>The name of your NFT collection</FormDescription>
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
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                A short uppercase symbol for your collection (e.g., BTC, ETH)
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
              <FormLabel>Collection Image</FormLabel>
              <FormControl>
                <ImageUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormDescription>
                Upload a cover image for your collection
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
                <Input placeholder="https://your-website.com" {...field} />
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
  );
}

"use client";

import type React from "react";

import { Upload } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Textarea,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui";
import DeployCollectionForm from "@/components/DeployCollectionForm";

export default function CreateNFT() {
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };
  type FormValues = {
    contractName: string;
    tokenSymbol: string;
    contractDescription: string;
    logoImage: File | string | null;
    status: "PUBLIC" | "PRIVATE";
  };
  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <div className="min-h-[calc(100vh-128px)] bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Create an NFT</h1>
          <p className="text-zinc-400">
            Once your item is minted you will not be able to change any of its
            information.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div
            className={`border rounded-lg aspect-[350/200] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${
              dragActive ? "border-blue-500 bg-muted/50" : "border-zinc-700"
            } hover:bg-muted/50 transition-colors`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
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
                src={imageUrl}
                alt="Uploaded NFT"
                fill
                className="object-contain"
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
                  Recommended size: 350 x 350. File types: JPG, PNG, SVG, or GIF
                </p>
              </>
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center">
                Collection
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Dialog>
                <DialogTrigger className="w-full justify-start text-left bg-zinc-900 border-zinc-800 rounded-xl">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left bg-zinc-900 border-zinc-800"
                  >
                    <span className="mr-2">+</span>
                    Create a new collection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DeployCollectionForm onSubmit={onSubmit} />
                </DialogContent>
              </Dialog>

              <p className="text-sm text-zinc-400">
                Not all collections are eligible.{" "}
                <Link href="#" className="text-blue-400 hover:text-blue-300">
                  Learn more
                </Link>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                placeholder="Name your NFT"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                Supply
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                type="number"
                defaultValue="1"
                min="1"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter a description"
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>External link</Label>
              <Input
                placeholder="https://collection.io/item/123"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <Label>Traits</Label>
              <p className="text-sm text-zinc-400">
                Traits describe attributes of your item. They appear as filters
                inside your collection page and are also listed out inside your
                item page.
              </p>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-zinc-900 border-zinc-800"
              >
                <span className="mr-2">+</span>
                Add trait
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

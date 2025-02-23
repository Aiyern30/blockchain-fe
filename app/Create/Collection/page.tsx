"use client";

import type React from "react";

import { Upload } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Textarea, Button, Input, Label } from "@/components/ui";

export default function CreateNFT() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px] ${
              dragActive ? "border-blue-500" : "border-zinc-700"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrag}
          >
            <Upload className="w-8 h-8 mb-4 text-zinc-400" />
            <p className="text-center mb-2">Drag and drop media</p>
            <p className="text-blue-400 hover:text-blue-300 mb-4">
              <Link href="#">Browse files</Link>
            </p>
            <p className="text-sm text-zinc-500">Max size: 50MB</p>
            <p className="text-sm text-zinc-500">JPG, PNG, GIF, SVG, MP4</p>
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center">
                Collection
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-zinc-900 border-zinc-800"
              >
                <span className="mr-2">+</span>
                Create a new collection
              </Button>
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

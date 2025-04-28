"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/";
import { Input } from "@/components/ui/";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // This is a mock implementation - in a real app, you would upload to a storage service
      // For demo purposes, we're creating a local object URL
      const objectUrl = URL.createObjectURL(file);

      // In a real implementation, you would get back a URL from your upload service
      // const response = await uploadToService(file);
      // const url = response.url;

      setPreview(objectUrl);
      onChange(objectUrl);

      // Note: In a real app, you'd use the actual URL from your storage service
      // onChange(url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className="space-y-4 w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-64 bg-gray-50 relative">
        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Collection preview"
              fill
              className="object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop an image, or click to browse
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        )}
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}

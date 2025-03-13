"use client";

import type React from "react";

import { Upload, Ban } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DeployCollectionForm from "@/components/DeployCollectionForm";

export default function CreateNFT() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
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
  type ContractFormValues = {
    contractName: string;
    supply: number;
    tokenSymbol: string;
    contractDescription: string;
    logoImage: File | string | null;
    status: "PUBLIC" | "PRIVATE";
  };

  type FormValues = {
    contractName: string;
    tokenSymbol: string;
    contractDescription: string;
    logoImage: File | string | null;
    status: "PUBLIC" | "PRIVATE";
  };

  const formMethods = useForm<ContractFormValues>({
    mode: "onChange",
    defaultValues: {
      contractName: "",
      supply: 0,
      tokenSymbol: "",
      contractDescription: "",
      logoImage: null,
      status: "PUBLIC",
    },
  });

  const { handleSubmit, control, setValue, watch, formState } = formMethods;
  const { errors, isValid } = formState;
  const selectedFile = watch("logoImage");

  const handleContractSubmit = (
    ContractData: FormValues & { txHash: string }
  ) => {
    console.log("Deployed Contract:", ContractData);
  };
  const onSubmit = () => {
    console.log("Deployed Contract:");
  };

  return (
    <div className="min-h-[calc(100vh-128px)] bg-black text-white p-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader className="mb-6">
          <CardTitle>Create an NFT</CardTitle>
          <CardDescription>
            Once your item is minted you will not be able to change any of its
            information.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid lg:grid-cols-2 gap-8">
          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                          document.getElementById("dialog-file-input")?.click()
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
                              Recommended size: 350 x 350. File types: JPG, PNG,
                              SVG, or GIF
                            </p>
                          </>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Form Section */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Contract
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Dialog>
                    <DialogTrigger className="w-full justify-start text-left bg-zinc-900 border-zinc-800 rounded-xl">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left bg-zinc-900 border-zinc-800"
                      >
                        <span className="mr-2">+</span>
                        Create a new Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                      <DeployCollectionForm onSubmit={handleContractSubmit} />
                    </DialogContent>
                  </Dialog>

                  <p className="text-sm text-zinc-400">
                    Not all Contracts are eligible.{" "}
                    <Link
                      href="#"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="grid gap-6 grid-cols-1">
                <FormField
                  control={control}
                  name="contractName"
                  rules={{ required: "Contract name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Contract Name" {...field} />
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
                        "Contract description must be 500 characters or less",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Contract description (Max 500 chars)"
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
              <FormField
                control={control}
                name="supply"
                rules={{ required: "Supply is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supply</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Supply" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant="default"
                type="submit"
                className={cn(
                  "mt-2 flex items-center gap-2",
                  (!isValid || !selectedFile) && "cursor-not-allowed opacity-50"
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
    </div>
  );
}

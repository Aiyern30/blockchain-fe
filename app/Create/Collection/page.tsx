"use client";

import type React from "react";

import { Upload, Ban, Trash, Plus } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import DeployCollectionForm from "@/components/DeployCollectionForm";

export default function CreateNFT() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [traits, setTraits] = useState<{ type: string; name: string }[]>([]);
  const [isTraitDialogOpen, setTraitDialogOpen] = useState(false);
  const [traitType, setTraitType] = useState("");
  const [traitName, setTraitName] = useState("");
  const addTrait = () => {
    if (traitType && traitName) {
      setTraits([...traits, { type: traitType, name: traitName }]);
      setTraitType("");
      setTraitName("");
      setTraitDialogOpen(false);
    }
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

        <CardContent>
          <FormProvider {...formMethods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Image Upload Section - Left Side */}
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

              {/* Form Fields Section - Right Side */}
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
                      <DeployCollectionForm onSubmit={handleContractSubmit} />
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a description"
                            {...field}
                            className="resize-none h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Traits</Label>
                  <p className="text-sm text-zinc-400">
                    Traits describe attributes of your item. They appear as
                    filters inside your collection page and are also listed out
                    inside your item page.
                  </p>
                  {traits.map((trait, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border p-2 rounded-lg"
                    >
                      <span>
                        {trait.type}: {trait.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setTraits(traits.filter((_, i) => i !== index))
                        }
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Dialog
                    open={isTraitDialogOpen}
                    onOpenChange={setTraitDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2" /> Add trait
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
                        onChange={(e) => setTraitType(e.target.value)}
                        className="mb-4"
                      />
                      <Input
                        placeholder="Trait Name (e.g., Red)"
                        value={traitName}
                        onChange={(e) => setTraitName(e.target.value)}
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

                <Button
                  variant="default"
                  type="submit"
                  className={cn(
                    "mt-6 w-full",
                    (!isValid || !selectedFile) &&
                      "cursor-not-allowed opacity-50"
                  )}
                  disabled={!isValid || !selectedFile}
                >
                  {(!isValid || !selectedFile) && (
                    <Ban className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  Deploy Contract
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}

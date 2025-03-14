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
import DeployCollectionForm from "@/components/deployCollectionForm";

export default function CreateNFT() {
  type ContractFormValues = {
    contractName: string;
    supply: number;
    contractDescription: string;
    logoImage: File | string | null;
    status: "PUBLIC" | "PRIVATE";
    traits: { type: string; name: string }[];
    externalLink?: string;
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
      contractDescription: "",
      logoImage: null,
      status: "PUBLIC",
      traits: [],
      externalLink: "",
    },
  });

  const { handleSubmit, control, setValue, watch, formState } = formMethods;
  const { errors, isValid } = formState;
  const selectedFile = watch("logoImage");

  // Use a local state to track traits to avoid re-render issues
  const [traits, setTraits] = useState<{ type: string; name: string }[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isTraitDialogOpen, setTraitDialogOpen] = useState(false);
  const [traitType, setTraitType] = useState("");
  const [traitName, setTraitName] = useState("");
  const [collectionCID, setCollectionID] = useState<string | null>(null);

  const addTrait = () => {
    if (traitType && traitName) {
      const newTraits = [...traits, { type: traitType, name: traitName }];
      setTraits(newTraits);
      setTraitType("");
      setTraitName("");
      setTraitDialogOpen(false);
    }
  };

  const removeTrait = (index: number) => {
    const newTraits = traits.filter((_, i) => i !== index);
    setTraits(newTraits);
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

  const handleContractSubmit = (
    ContractData: FormValues & { collectionCID: string }
  ) => {
    console.log("Deployed Contract:", ContractData);
    setCollectionID(collectionCID);
  };

  const onSubmit = (data: ContractFormValues) => {
    console.log("Deployed Contract:", data);
    toast.success("NFT created successfully!");
  };

  const hardcodedCollection = {
    image: "/404.svg",
    name: "Hardcoded Collection Name",
    description: "This is a hardcoded description of the collection.",
  };

  return (
    <div className="min-h-[calc(100vh-128px)] p-6">
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
                            document.getElementById("file-input")?.click()
                          }
                        >
                          <input
                            id="file-input"
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

              <div className="space-y-6">
                {!collectionCID ? (
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Collection
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Dialog>
                      <DialogTrigger className="w-full justify-start text-left rounded-xl">
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left "
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
                ) : (
                  <div className="p-4 rounded-xl flex space-x-4 items-center">
                    <Image
                      src={
                        hardcodedCollection.image ||
                        "https://via.placeholder.com/100"
                      }
                      alt="Collection Image"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {hardcodedCollection.name || "Unnamed Collection"}
                      </h3>
                      <p className="text-sm text-zinc-400">
                        {hardcodedCollection.description ||
                          "No description available."}
                      </p>
                    </div>
                  </div>
                )}

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
                    rules={{
                      required: "Description is required",
                      minLength: {
                        value: 10,
                        message: "Description must be at least 10 characters",
                      },
                      maxLength: {
                        value: 500,
                        message: "Description must be 500 characters or less",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Description
                          <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a description"
                            {...field}
                            className="resize-none h-32"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <FormMessage />
                          <span>{field.value?.length || 0}/500</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={control}
                    name="externalLink"
                    rules={{
                      pattern: {
                        value:
                          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                        message: "Please enter a valid URL",
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://collection.io/item/123"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={control}
                    name="traits"
                    rules={{
                      validate: (value) => {
                        if (!value || value.length === 0) {
                          return formState.isSubmitted
                            ? "At least one trait is required"
                            : true;
                        }
                        return true;
                      },
                    }}
                    render={() => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>
                            Traits
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                        </div>
                        <FormControl>
                          <div className="space-y-2">
                            <p className="text-sm text-zinc-400">
                              Traits describe attributes of your item. They
                              appear as filters inside your collection page and
                              are also listed out inside your item page.
                            </p>

                            <div className="space-y-2 mt-2">
                              {traits.length > 0 ? (
                                traits.map((trait, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center border border-zinc-700 p-2 rounded-lg"
                                  >
                                    <div className="flex items-center justify-center gap-5">
                                      <div>{trait.type}</div>:
                                      <div>{trait.name}</div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeTrait(index)}
                                    >
                                      <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-zinc-500 italic">
                                  No traits added yet
                                </div>
                              )}
                            </div>

                            <Dialog
                              open={isTraitDialogOpen}
                              onOpenChange={setTraitDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full mt-2"
                                >
                                  <Plus className="mr-2" /> Add Trait
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  variant="default"
                  type="submit"
                  className={cn(
                    "mt-6 w-full",
                    (!isValid ||
                      !selectedFile ||
                      !collectionCID ||
                      traits.length === 0) &&
                      "cursor-not-allowed opacity-50"
                  )}
                  disabled={
                    !isValid ||
                    !selectedFile ||
                    !collectionCID ||
                    traits.length === 0
                  }
                >
                  {(!isValid ||
                    !selectedFile ||
                    !collectionCID ||
                    traits.length === 0) && (
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

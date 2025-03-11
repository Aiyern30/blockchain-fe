import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Textarea,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/";
import Image from "next/image";
import { Upload, Ban, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
type Blockchain = "ethereum" | "base" | null;
interface DeployContractFormProps {
  onSubmit: (data: FormValues) => void;
}
export default function DeployContractForm({
  onSubmit,
}: DeployContractFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] =
    useState<Blockchain>(null);

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

  const { handleSubmit, control, setValue, watch, formState } = formMethods;
  const { errors, isValid } = formState;
  const selectedFile = watch("logoImage");

  return (
    <Card className="space-y-8 bg-background">
      <CardHeader>
        <CardTitle>Let&apos;s create a smart contract for your drop.</CardTitle>
        <CardDescription>
          You&apos;ll need to deploy an ERC-721 contract onto the blockchain
          before you can create a drop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
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

              <div className="grid gap-6 grid-cols-1">
                <FormField
                  control={control}
                  name="collectionName"
                  rules={{ required: "Collection name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Collection Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1">
                <FormField
                  control={control}
                  name="collectionDescription"
                  rules={{
                    required: "Collection description is required",
                    maxLength: {
                      value: 500,
                      message:
                        "Collection description must be 500 characters or less",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter Collection description (Max 500 chars)"
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
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="contractName"
                  rules={{ required: "Contract name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My Collection Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="tokenSymbol"
                  rules={{ required: "Token symbol is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="MCN" {...field} />
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
                      message: "Description must be 500 characters or less",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter NFT description (Max 500 chars)"
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
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="price"
                  rules={{ required: "Listed Price is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listed Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="My Listed Price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="maxSupply"
                  rules={{ required: "Maximum Supply is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Supply</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Maximum Supply"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Blockchain</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          A blockchain is a digitally distributed ledger that
                          records transactions and information across a
                          decentralized network. There are different types of
                          blockchains, which you can choose to drop on.
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          You cannot change the blockchain once you deploy your
                          contract.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card
                    className={cn(
                      "relative cursor-pointer transition-colors hover:border-primary",
                      selectedBlockchain === "ethereum" &&
                        "border-primary bg-muted/50"
                    )}
                    onClick={() => setSelectedBlockchain("ethereum")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full overflow-hidden">
                          <Image
                            src="https://opensea.io/static/images/logos/ethereum.svg"
                            alt="Ethereum"
                            width={32}
                            height={32}
                            className="bg-[#627EEA] p-1"
                          />
                        </div>
                        <span className="font-medium">Ethereum</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Most popular
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estimated cost to deploy contract:
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card
                              className={cn(
                                "relative cursor-pointer transition-colors hover:border-primary",
                                selectedBlockchain === "base" &&
                                  "border-primary bg-muted/50"
                              )}
                              onClick={() => setSelectedBlockchain("base")}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="rounded-full overflow-hidden bg-white">
                                    <Image
                                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nYlEWWzFKtOY9epUSVbiAOpm3PmO5w.png"
                                      alt="Base"
                                      width={32}
                                      height={32}
                                    />
                                  </div>
                                  <span className="font-medium">Base</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    Cheaper
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Estimated cost to deploy contract: $0.00
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
        
                            <Card className="cursor-pointer hover:border-primary">
                              <CardContent className="p-4 h-full flex flex-col justify-center items-center text-muted-foreground">
                                <MoreHorizontal className="h-6 w-6 mb-2" />
                                <span className="font-medium">See more options</span>
                              </CardContent>
                            </Card> */}
                </div>
              </div>
            </div>

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
  );
}

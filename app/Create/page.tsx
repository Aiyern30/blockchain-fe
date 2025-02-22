"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Info,
  Upload,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

export default function CreateContract() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Let&apos;s create a smart contract for your drop.
            </h1>
            <p className="text-muted-foreground">
              You&apos;ll need to deploy an ERC-721 contract onto the blockchain
              before you can create a drop.{" "}
              <a href="#" className="text-primary hover:underline">
                What is a contract?
              </a>
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-medium">Logo image</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your collection&apos;s logo image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div
                className={cn(
                  "border rounded-lg aspect-[350/200] flex flex-col items-center justify-center cursor-pointer",
                  "hover:bg-muted/50 transition-colors",
                  dragActive && "border-primary bg-muted/50"
                )}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  Drag and drop or click to upload
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You may change this after deploying your contract.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Recommended size: 350 x 350. File types: JPG, PNG, SVG, or GIF
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Contract name</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The name of your smart contract</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input placeholder="My Collection Name" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="font-medium">Token symbol</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The symbol for your token</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input placeholder="MCN" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="font-medium">Blockchain</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the blockchain for your contract</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="relative border-primary bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="rounded-full overflow-hidden">
                        <Image
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-nYlEWWzFKtOY9epUSVbiAOpm3PmO5w.png"
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

                <Card>
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
                      <p className="text-sm text-muted-foreground">Cheaper</p>
                      <p className="text-sm text-muted-foreground">
                        Estimated cost to deploy contract: $0.00
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 h-full flex flex-col justify-center items-center text-muted-foreground">
                    <MoreHorizontal className="h-6 w-6 mb-2" />
                    <span className="font-medium">See more options</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              After you deploy your contract you&apos;ll be able to:
            </h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Manage collection settings</p>
                  <p className="text-sm text-muted-foreground">
                    Edit collection details, earnings, and links.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1">
                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Set up your drop</p>
                  <p className="text-sm text-muted-foreground">
                    Set up your mint schedule and presale stages.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Prepare designs</p>
                  <p className="text-sm text-muted-foreground">
                    Customize your pages and upload all assets.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Your community:</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1">
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Can&apos;t view</p>
                  <p className="text-sm text-muted-foreground">
                    Your drop page or items until you publish them.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Can view</p>
                  <p className="text-sm text-muted-foreground">
                    That you&apos;ve deployed a contract onto the blockchain.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

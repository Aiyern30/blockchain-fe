/* eslint-disable react/no-unescaped-entities */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import {
  Sparkles,
  FileImage,
  Tag,
  Trophy,
  Bookmark,
  Database,
} from "lucide-react";
import React from "react";

const NFTInformation = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>When creating your NFT, consider:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <FileImage className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Choose compelling visuals</p>
                <p className="text-sm text-muted-foreground">
                  Select high-quality images that represent your NFT's
                  uniqueness and value.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Tag className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Add meaningful attributes</p>
                <p className="text-sm text-muted-foreground">
                  Attributes enhance discoverability and help collectors
                  understand your NFT's rarity and properties.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Craft a compelling description</p>
                <p className="text-sm text-muted-foreground">
                  Tell the story behind your NFT to create connection and
                  increase its perceived value.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Benefits of well-crafted NFTs:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <Trophy className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Increased visibility</p>
                <p className="text-sm text-muted-foreground">
                  NFTs with complete metadata and attractive visuals tend to
                  receive more attention.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Better collector engagement</p>
                <p className="text-sm text-muted-foreground">
                  Detailed NFTs help collectors understand and appreciate the
                  value of your creation.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Immutable on-chain record</p>
                <p className="text-sm text-muted-foreground">
                  Your NFT metadata will be permanently recorded on the
                  blockchain once minted.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};

export default NFTInformation;

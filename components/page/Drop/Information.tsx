/* eslint-disable react/no-unescaped-entities */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Sparkles, Palette, EyeOff, Eye } from "lucide-react";
import React from "react";

const Information = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            After creating your collection, you'll be able to:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Add NFTs to your collection</p>
                <p className="text-sm text-muted-foreground">
                  Insert multiple NFTs under your created collection to organize
                  your assets.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Include detailed metadata</p>
                <p className="text-sm text-muted-foreground">
                  Add external links, attributes, and descriptions for each NFT.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Palette className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Personalize your collection</p>
                <p className="text-sm text-muted-foreground">
                  Customize visuals for your collection page with banners,
                  icons, and more.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What others will experience:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Can view your NFTs</p>
                <p className="text-sm text-muted-foreground">
                  Visitors can explore all NFTs within your collection once it's
                  published.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Cannot modify your collection</p>
                <p className="text-sm text-muted-foreground">
                  Only you can customize or update the collection and NFTs after
                  deployment.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
};

export default Information;

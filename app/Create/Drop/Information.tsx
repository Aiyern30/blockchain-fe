import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Sparkles, Palette, EyeOff, Eye } from "lucide-react";
import React from "react";

const Information = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Once your contract is deployed, you&apos;ll have the ability to:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Adjust collection preferences</p>
                <p className="text-sm text-muted-foreground">
                  Modify collection details, royalties, and external links.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Configure your release</p>
                <p className="text-sm text-muted-foreground">
                  Define minting phases, presale access, and schedules.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Palette className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Customize visuals</p>
                <p className="text-sm text-muted-foreground">
                  Personalize your drop page and upload all media assets.
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your audience:</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-1">
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Won&apos;t see</p>
                <p className="text-sm text-muted-foreground">
                  Your minting page or assets until you make them public.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1">
                <Eye className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Will see</p>
                <p className="text-sm text-muted-foreground">
                  That your smart contract has been successfully deployed.
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

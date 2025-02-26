import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Sparkles, Palette, EyeOff, Eye } from "lucide-react";
import React from "react";

const Information = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            After you deploy your contract you&apos;ll be able to:
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your community:</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </>
  );
};

export default Information;

import { Button, Card, CardContent } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  ShoppingCart,
  Heart,
  Share2,
  BarChart2,
  Clock,
  Tag,
  Activity,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NFTDetails() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* NFT Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png"
                alt="NFT"
                className="object-cover"
                fill
                priority
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Properties</h3>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground">
                        Background
                      </p>
                      <p className="font-medium">Blue</p>
                      <p className="text-xs text-muted-foreground">
                        12% have this trait
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Collection Name
              </Link>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold">NFT Name #1234</h1>
              <p className="text-sm text-muted-foreground">
                Owned by{" "}
                <Link href="#" className="text-primary hover:underline">
                  0x1234...5678
                </Link>
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Price
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">12.34 ETH</span>
                      <span className="text-muted-foreground">($23,456)</span>
                    </div>
                  </div>
                  <div
                    className="
                      relative w-full 
                      flex justify-between
                      rounded bg-white/80 
                    "
                  >
                    <div className="flex w-[49%]">
                      <Button className="flex w-3/4 items-center justify-center space-x-2 border-r border-r-white bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <span>Buy now</span>
                      </Button>
                      <Button className="flex w-1/4 items-center justify-center space-x-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <ShoppingCart className="h-4" />
                      </Button>
                    </div>
                    <Button className="flex w-[49%] items-center justify-center space-x-2 bg-gray-400 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                      <span>Make Offer</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-400 grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="price-history">Price History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">
                    This unique NFT is part of the Collection Name. It features
                    distinctive traits and was created by Artist Name.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Details</h3>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>Contract Address</span>
                      </div>
                      <Link href="#" className="text-primary hover:underline">
                        0x1234...5678
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                        <span>Token ID</span>
                      </div>
                      <span>1234</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Token Standard</span>
                      </div>
                      <span>ERC-721</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="properties">
                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">
                          Property Type
                        </p>
                        <p className="font-medium">Value</p>
                        <p className="text-xs text-muted-foreground">
                          Rarity %
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="activity">
                <div className="space-y-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium">
                      <div>Event</div>
                      <div>Price</div>
                      <div>From</div>
                      <div>Date</div>
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 gap-4 border-t p-4 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Sale
                        </div>
                        <div>12.34 ETH</div>
                        <Link href="#" className="text-primary hover:underline">
                          0x1234...5678
                        </Link>
                        <div className="text-muted-foreground">2 days ago</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="price-history">
                <Card>
                  <CardContent className="p-6">
                    <div className="aspect-[2/1] w-full rounded-lg border" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <h3 className="font-semibold">More from this collection</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Link key={i} href="#" className="space-y-2">
                    <div className="aspect-square overflow-hidden rounded-lg border">
                      <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png"
                        alt="NFT"
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div>
                      <p className="font-medium">NFT Name #{i + 1}</p>
                      <p className="text-sm text-muted-foreground">12.34 ETH</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

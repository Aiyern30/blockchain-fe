"use client";
import Image from "next/image";
import { Check, Table } from "lucide-react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

const timeFrames = ["1h", "6h", "24h", "7d"];

const collections = [
  {
    rank: 1,
    name: "Courtyard.io",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "< 0.01",
    volume: "400",
  },
  {
    rank: 2,
    name: "Gemesis",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tO1dmfKUgg1zYW5TQWC5KzvN36RPil.png",
    verified: true,
    floorPrice: "0.05",
    volume: "63",
  },
  // Add more collections as needed
];

export default function CryptoTable() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Tabs defaultValue="trending">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {timeFrames.map((time) => (
              <Button
                key={time}
                variant="ghost"
                className="text-sm hover:bg-zinc-800"
              >
                {time}
              </Button>
            ))}
            <Select>
              <SelectTrigger className="w-[130px] bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="All chains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chains</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" className="text-sm hover:bg-zinc-800">
              View all
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-zinc-900">
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow
                  key={collection.rank}
                  className="hover:bg-zinc-900 cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {collection.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8">
                        <Image
                          src={collection.image || "/placeholder.svg"}
                          alt={collection.name}
                          className="rounded-full"
                          fill
                        />
                      </div>
                      <span className="font-medium">{collection.name}</span>
                      {collection.verified && (
                        <Check className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{collection.floorPrice} ETH</TableCell>
                  <TableCell>{collection.volume} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

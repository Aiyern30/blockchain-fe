import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useDeviceType } from "@/utils/useDeviceType";
import { BadgeCheckIcon } from "lucide-react";
import React from "react";
import Image from "next/image";

type Collection = {
  rank: number;
  name: string;
  image: string;
  verified: boolean;
  floorPrice: string;
  volume: string;
};

interface CryptoTableProps {
  collections: Collection[];
  shouldSplit: boolean;
}

const CryptoTable = ({ collections, shouldSplit }: CryptoTableProps) => {
  const { isMobile } = useDeviceType();

  return (
    <div className="flex items-center justify-center gap-5 mt-5">
      {isMobile || !shouldSplit ? (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow key={collection.rank} className="cursor-pointer h-16">
                  <TableCell className="font-medium text-center">
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
                        <span className="text-blue-500">
                          <BadgeCheckIcon className="w-4 h-4" />
                        </span>
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
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-[320px]">
              {collections.slice(0, 5).map((collection) => (
                <TableRow key={collection.rank} className="cursor-pointer h-16">
                  <TableCell className="font-medium text-center">
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
                        <span className="text-blue-500">
                          <BadgeCheckIcon className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{collection.floorPrice} ETH</TableCell>
                  <TableCell>{collection.volume} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-[320px]">
              {collections.slice(5).map((collection) => (
                <TableRow key={collection.rank} className="cursor-pointer h-16">
                  <TableCell className="font-medium text-center">
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
                        <span className="text-blue-500">
                          <BadgeCheckIcon className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{collection.floorPrice} ETH</TableCell>
                  <TableCell>{collection.volume} ETH</TableCell>
                </TableRow>
              ))}
              {collections.slice(5).length < 5 &&
                Array.from({ length: 5 - collections.slice(5).length }).map(
                  (_, i) => (
                    <TableRow key={`empty-${i}`} className="h-16 border-0">
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};

export default CryptoTable;

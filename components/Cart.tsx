"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Input,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { BsCart4 } from "react-icons/bs";
import { ChevronDown, Trash } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  creatorEarnings: number;
}

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Human Paladin IV #10",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
      price: 0.043,
      creatorEarnings: 75,
    },
    {
      id: "2",
      name: "Elf Warrior III #8",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
      price: 0.059,
      creatorEarnings: 50,
    },
    {
      id: "3",
      name: "Dwarf Mage II #6 with a Very Long Name That Should Be Truncated",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-AVmPR5Cs0DWWtwY520inl3yAzqnPm7.png",
      price: 0.031,
      creatorEarnings: 60,
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [hoverIndex, setHoverIndex] = useState<string | null>(null);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const usdPrice = totalPrice * 2760;

  const clearCart = () => setItems([]);
  const removeItem = (id: string) =>
    setItems(items.filter((item) => item.id !== id));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <BsCart4 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[400px] flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <SheetHeader>
            <SheetTitle className="text-xl font-normal">Your cart</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <span>
              {items.length} item{items.length !== 1 && "s"}
            </span>
            <Button variant="ghost" onClick={clearCart}>
              Clear all
            </Button>
          </div>

          <div className="px-6 py-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-[#7b3fe4] dark:hover:bg-blue-900 hover:text-white transition"
                onMouseEnter={() => setHoverIndex(item.id)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="font-medium truncate max-w-[150px]">
                            {item.name}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <p className="text-sm text-gray-400">
                      Creator earnings: {item.creatorEarnings}%
                    </p>
                  </div>
                </div>

                {/* Price or Delete button on hover */}
                <div className="flex items-center gap-2">
                  {hoverIndex === item.id ? (
                    <button
                      className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  ) : (
                    <p className="font-medium">{item.price} ETH</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t px-6 py-4">
          <div className="flex justify-between mb-4">
            <span className="text-lg">Total price</span>
            <div className="text-right">
              <div className="text-lg">{totalPrice.toFixed(3)} ETH</div>
              <div className="text-sm text-gray-400">
                ${usdPrice.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between"
              >
                <span className="text-gray-400">
                  {walletAddress || "Send to a different wallet"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {isOpen && (
                <Input
                  type="text"
                  placeholder="Enter wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-transparent mt-2"
                />
              )}
            </div>

            <Button className="w-full">Complete purchase</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

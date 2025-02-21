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
} from "@/components/ui";
import { BsCart4 } from "react-icons/bs";
import { ChevronDown } from "lucide-react";

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
      image: "/placeholder.svg?height=60&width=60",
      price: 0.043,
      creatorEarnings: 75,
    },
    {
      id: "2",
      name: "Human Paladin IV #10",
      image: "/placeholder.svg?height=60&width=60",
      price: 0.043,
      creatorEarnings: 75,
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const usdPrice = totalPrice * 2760;

  const clearCart = () => setItems([]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <BsCart4 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:w-[400px]">
        <SheetHeader className="border-bpb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-xl font-normal">
              Your cart
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex items-center justify-between py-4 border-b">
          <span>
            {items.length} item{items.length !== 1 && "s"}
          </span>
          <Button variant="ghost" onClick={clearCart}>
            Clear all
          </Button>
        </div>

        <div className="py-4 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={60}
                height={60}
                className="rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-blue-500 fill-current"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">
                  Creator earnings: {item.creatorEarnings}%
                </p>
                <p className="mt-1 font-medium">{item.price} ETH</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <div className="border-t border-gray-800 py-4">
            <div className="flex justify-between mb-1">
              <span className="text-lg">Total price</span>
              <div className="text-right">
                <div className="text-lg">{totalPrice} ETH</div>
                <div className="text-sm text-gray-400">
                  ${usdPrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full"
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
                  className="bg-transparent border-gray-800 text-white placeholder:text-gray-500 mt-5"
                />
              )}
            </div>

            <Button className="w-full mt-4 ">Complete purchase</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

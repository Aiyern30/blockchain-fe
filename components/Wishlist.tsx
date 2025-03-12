"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/";

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

export default function WishlistSheet() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Modern Wooden Dining Table",
      price: 499,
      image: "/images/dining-table.jpg",
    },
    {
      id: 2,
      name: "Luxury Leather Sofa",
      price: 899,
      image: "/images/leather-sofa.jpg",
    },
    {
      id: 3,
      name: "Minimalist Bookshelf",
      price: 199,
      image: "/images/bookshelf.jpg",
    },
  ]);

  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const removeItem = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id));
    toast.success("Item removed from wishlist!", {
      description: "You can explore more products to add back.",
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    toast.success("Wishlist cleared!", {
      description: "Your wishlist has been emptied.",
      duration: 3000,
      style: { background: "#16a34a", color: "#fff" },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          <Button variant="outline" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
          {wishlistItems.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {wishlistItems.length}
            </span>
          )}
        </div>
      </SheetTrigger>

      <SheetContent className="w-[380px] sm:w-[400px] flex flex-col p-0">
        <div className="px-6 py-4 border-b">
          <SheetHeader>
            <SheetTitle>Your Wishlist</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto">
          {wishlistItems.length > 0 ? (
            <>
              <div className="px-6 pt-0 pb-4 border-b flex items-center justify-between">
                <span>
                  {wishlistItems.length} item{wishlistItems.length !== 1 && "s"}
                </span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">Clear all</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will remove all items
                        from your wishlist.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearWishlist}>
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="px-6 py-4 space-y-4">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-3"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">${item.price}</p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </AlertDialogTrigger>
                      {selectedItem && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Item</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove{" "}
                              <span className="font-semibold">
                                {selectedItem.name}
                              </span>{" "}
                              from your wishlist?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="flex items-center gap-4">
                            <Image
                              src={selectedItem.image}
                              alt={selectedItem.name}
                              width={60}
                              height={60}
                              className="rounded"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {selectedItem.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                ${selectedItem.price}
                              </p>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeItem(selectedItem.id)}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full">
              <Image
                src="/shopping-cart.svg"
                alt="Empty Wishlist"
                width={300}
                height={300}
                className="mb-4"
              />
              <p className="text-gray-500 text-xl">Your wishlist is empty.</p>
              <Link href="/Product">
                <Button className="mt-4" onClick={() => setIsOpen(false)}>
                  Explore Products
                </Button>
              </Link>
            </div>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="border-t pt-4 px-6">
            <Link href="/Wishlist">
              <Button className="w-full mt-4" onClick={() => setIsOpen(false)}>
                View Wishlist
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { WalletIcon } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import Link from "next/link";
import { Copy, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import MotionButton from "./MotionButton";

interface HeaderProps {
  loggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  details: {
    address: string;
    chainID: string;
    transactionHistory: any[];
    signMessage: string;
  };
}

const Header: React.FC<HeaderProps> = ({
  loggedIn,
  login,
  logout,
  details,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  console.log("walletAddress", walletAddress);
  const [balance, setBalance] = useState("");
  const [loadingWalletInfo, setLoadingWalletInfo] = useState(true);

  useEffect(() => {
    const address = localStorage.getItem("MyAddress");
    console.log("hi", address);
    const balanceValue = localStorage.getItem("MyBalance");

    // Only update state if the value has changed
    if (address && walletAddress !== address) {
      setWalletAddress(address);
    }

    if (balanceValue && balance !== balanceValue) {
      setBalance(balanceValue);
    }

    // Set loading to false after fetching
    setLoadingWalletInfo(false);
  }, []); // Added dependencies

  const truncatedAddress = `${walletAddress.slice(
    0,
    6
  )}...${walletAddress.slice(-4)}`;
  const { toast } = useToast();

  const handleViewDetails = () => {
    router.push(
      `/TransactionHistory?query={transaction:${JSON.stringify(
        details.transactionHistory
      )}}`
    );
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was an issue logging out. Please try again.",
        color: "red",
      });
    } finally {
      setLoadingLogout(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard
        .writeText(walletAddress)
        .then(() => {
          setCopied(true);
          toast({
            title: "Copied!",
            description: "Wallet address copied to clipboard.",
            color: "green",
          });
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast({
            title: "Copy Failed",
            description: "Could not copy the wallet address.",
            color: "red",
          });
        });
    }
  };

  const handleShare = () => {
    if (walletAddress) {
      if (navigator.share) {
        navigator
          .share({
            title: "Wallet Address",
            text: `Check out my wallet address: ${walletAddress}`,
            url: `https://ian-gan.vercel.app/${walletAddress}`,
          })
          .then(() => {
            // Optionally handle success
          })
          .catch((error) => {
            console.error("Sharing failed:", error);
            toast({
              title: "Share Failed",
              description: "Could not share the wallet address.",
              color: "red",
            });
          });
      } else {
        toast({
          title: "Share Not Supported",
          description: "Your browser does not support the share feature.",
          color: "red",
        });
      }
    } else {
      console.log("No wallet address available to share.");
    }
  };

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between">
      <Link className="flex items-center justify-center" href="#">
        <Lock className="h-6 w-6 mr-2" />
        <span className="font-bold">Web3 Future</span>
      </Link>
      <nav className="flex gap-4 sm:gap-6">
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="#features"
        >
          Features
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="#about"
        >
          About
        </Link>
        <Link
          className="text-sm font-medium hover:underline underline-offset-4"
          href="#contact"
        >
          Contact
        </Link>
      </nav>
      {loggedIn ? (
        <>
          {loadingWalletInfo ? (
            <div>Loading wallet information...</div>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <MotionButton title={truncatedAddress} icon={<WalletIcon />} />
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Wallet Information</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <h2 className="text-2xl font-bold">Available Balance</h2>
                    <p className="text-4xl font-bold">ETH {balance}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Address</p>
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <code className="text-sm">{walletAddress}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopy}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    onClick={handleShare}
                  >
                    Share Address
                  </Button>

                  <div>
                    {details.transactionHistory.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">Recent Activity</h3>
                          <Button
                            variant="link"
                            className="text-sm"
                            onClick={handleViewDetails}
                          >
                            View Details
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {details.transactionHistory
                            .slice(0, 1)
                            .map((activity, index) => (
                              <div
                                key={index}
                                className="flex items-start justify-between p-2 border rounded-md bg-gray-50 shadow-sm"
                              >
                                <div className="flex flex-col">
                                  <p className="font-semibold text-md">
                                    From:{" "}
                                    <span className="font-normal">
                                      {activity.from}
                                    </span>
                                  </p>
                                  <p className="font-semibold text-md">
                                    To:{" "}
                                    <span className="font-normal">
                                      {activity.to}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Transaction Hash:{" "}
                                    <span className="font-medium">
                                      {activity.hash}
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Date:{" "}
                                    <span className="font-medium">
                                      {new Date(
                                        activity.timeStamp * 1000
                                      ).toLocaleDateString()}
                                    </span>
                                  </p>
                                </div>
                                <p
                                  className={`text-lg font-bold ${
                                    activity.value < 0
                                      ? "text-red-500"
                                      : "text-green-500"
                                  }`}
                                >
                                  {activity.value > 0 ? "+" : "-"}$
                                  {parseFloat(
                                    ethers.formatEther(activity.value)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full ${
                      loadingLogout
                        ? "bg-gray-400"
                        : "bg-gradient-to-r from-red-500 to-red-700"
                    } text-white`}
                    onClick={handleLogout}
                    disabled={loadingLogout}
                  >
                    {loadingLogout ? "Disconnecting..." : "Disconnect Wallet"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : (
        <MotionButton title={"Connect Wallet"} onClick={login} />
      )}
    </header>
  );
};

export default Header;

"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MotionButton from "@/components/wallet-dropdown/MotionButton";
import Image from "next/image";
import { truncateAddress } from "@/utils/function";

// const Web3AuthIcon = () => (
//   <svg
//     width="24"
//     height="24"
//     viewBox="0 0 24 19"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     aria-hidden="true"
//   >
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M10.9185 16.2531C10.8708 16.4314 11.0051 16.6064 11.1896 16.6064H12.8056C12.9901 16.6064 13.1244 16.4314 13.0767 16.2531L12.2686 13.2376C12.1943 12.9603 11.8009 12.9603 11.7265 13.2376L10.9185 16.2531Z"
//       fill="#0364FF"
//     />
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M9.3094 18.1833C9.18565 18.6451 8.76712 18.9663 8.28898 18.9663H6.10161C5.40699 18.9663 4.90141 18.3074 5.08119 17.6364L9.56846 0.889727C9.70382 0.384581 10.1616 0.0333252 10.6845 0.0333252H13.2878C13.8107 0.0333252 14.2685 0.384581 14.4039 0.889726L18.8911 17.6364C19.0709 18.3074 18.5653 18.9663 17.8707 18.9663H15.6833C15.2052 18.9663 14.7867 18.6451 14.6629 18.1833L12.4804 10.0381C12.3449 9.5324 11.6274 9.5324 11.4919 10.0381L9.3094 18.1833Z"
//       fill="#0364FF"
//     />
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M20.312 15.0275C20.1722 15.5495 19.4315 15.5495 19.2916 15.0275L17.6625 8.94772C17.631 8.83018 17.631 8.70641 17.6625 8.58886L19.7387 0.840666C19.8663 0.364386 20.2979 0.0332031 20.791 0.0332031H22.91C23.6263 0.0332031 24.1477 0.712676 23.9623 1.4046L20.312 15.0275ZM6.33475 8.93758C6.36624 8.82003 6.36624 8.69626 6.33475 8.57871L4.26134 0.840667C4.13373 0.364386 3.70212 0.0332031 3.20904 0.0332031H1.09003C0.373699 0.0332031 -0.147679 0.712676 0.0377209 1.4046L3.68525 15.0174C3.82512 15.5394 4.5658 15.5394 4.70567 15.0174L6.33475 8.93758Z"
//       fill="#0364FF"
//     />
//   </svg>
// );

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget:
    "https://eth-sepolia.g.alchemy.com/v2/IoU88nbTo3frUeQnfe1_SeaZ3Jawq8bZ",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

export default function WalletConnectDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [web3auth, setWeb3Auth] = useState<Web3Auth | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      const web3authInstance = new Web3Auth({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        privateKeyProvider: new EthereumPrivateKeyProvider({
          config: { chainConfig },
        }),
      });

      await web3authInstance.initModal();
      setWeb3Auth(web3authInstance);

      if (web3authInstance.provider) {
        const accounts = (await web3authInstance.provider.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };

    initWeb3Auth();
  }, []);

  // const loginWithWeb3Auth = async () => {
  //   if (!web3auth) return;

  //   try {
  //     await web3auth.connect();
  //     const accounts = (await web3auth.provider?.request({
  //       method: "eth_accounts",
  //     })) as string[];

  //     if (accounts.length > 0) {
  //       const address = accounts[0];
  //       setWalletAddress(address);
  //       localStorage.setItem("walletAddress", address);
  //       localStorage.setItem("isLoggedIn", "true");
  //     }
  //   } catch (error) {
  //     console.error("Web3Auth Login Failed:", error);
  //   }
  // };

  const logoutWeb3Auth = async () => {
    if (!web3auth) return;

    try {
      await web3auth.logout();
      await web3auth.clearCache(); // Ensure Web3Auth resets
      setWalletAddress(null);
      setWeb3Auth(null); // Reset Web3Auth state
      localStorage.removeItem("isLoggedIn");
    } catch (error) {
      console.error("Web3Auth Logout Failed:", error);
    }
  };

  return (
    <div className="relative">
      <ConnectButton.Custom>
        {({ account, openConnectModal }) => {
          const isRainbowKitConnected = !!account;
          const isWeb3AuthConnected = !!walletAddress;

          return isRainbowKitConnected ? (
            // If connected via RainbowKit, show its UI
            <ConnectButton />
          ) : isWeb3AuthConnected ? (
            <div className="bg-gray-800 text-white px-4 py-2 rounded flex items-center space-x-2">
              <span>{truncateAddress(walletAddress)}</span>

              <Button
                onClick={logoutWeb3Auth}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="relative">
              <MotionButton
                onClick={() => setIsOpen(!isOpen)}
                title="Connect Wallet"
                icon={
                  <motion.div
                    className="flex items-center justify-center origin-center"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDown className="w-4 h-4 text-white dark:text-gray-200" />
                  </motion.div>
                }
                iconPosition="right"
              />

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute mt-2 w-60 rounded-lg shadow-xl border bg-white 
                 dark:bg-gray-900 border-gray-300 dark:border-gray-700 
                 p-4 z-50"
                >
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={openConnectModal}
                      className="flex items-center gap-3 p-3 rounded-lg text-white dark:text-gray-200 
    bg-gradient-to-r from-[#7b3fe4] to-[#4F46E5] 
    dark:from-[#007bff] dark:to-[#0056b3] 
    hover:opacity-90 transition-all"
                    >
                      <Image
                        src="/rainbowkit.png"
                        alt="RainbowKit Icon"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span>Rainbow Kit</span>
                    </Button>

                    {/* <Button
                      onClick={loginWithWeb3Auth}
                      className="flex items-center gap-3 p-3 rounded-lg text-white dark:text-gray-200
    bg-gradient-to-r from-[#7b3fe4] to-[#4F46E5] 
    dark:from-[#007bff] dark:to-[#0056b3]
    hover:opacity-90 transition-all"
                    >
                      <div className="w-6 h-6 flex items-center justify-center bg-white">
                        <Web3AuthIcon />
                      </div>
                      <span>Web3Auth</span>
                    </Button> */}
                  </div>
                </motion.div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

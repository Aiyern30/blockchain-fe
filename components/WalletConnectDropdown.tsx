"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import MotionButton from "@/app/MotionButton";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const clientId =
  "BKXvqyFuFatVMKjN353Wm0E8U1XZTu3qtxcf5E2hYAs3IPkuulenJKfNl8VULXbxaq5ZyDQ3pAljtFOUh4tnPC0";

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

  const loginWithWeb3Auth = async () => {
    if (!web3auth) return;

    try {
      await web3auth.connect();
      const accounts = (await web3auth.provider?.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        localStorage.setItem("isLoggedIn", "true");
      }
    } catch (error) {
      console.error("Web3Auth Login Failed:", error);
    }
  };

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
            // If connected via Web3Auth, show wallet address + disconnect button
            <div className="bg-gray-800 text-white px-4 py-2 rounded flex items-center space-x-2">
              <span>
                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : ""}
              </span>
              <Button
                onClick={logoutWeb3Auth}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            // Show dropdown when no wallet is connected
            <div>
              <MotionButton
                onClick={() => setIsOpen(!isOpen)}
                title="Connect Wallet"
                icon={
                  <motion.div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="origin-center"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                }
                iconPosition="right"
              />

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute mt-2 w-56 bg-gray-800 shadow-lg rounded p-4 z-50"
                >
                  <div className="flex flex-col space-y-2">
                    {/* Clicking this will open RainbowKit's modal */}
                    <Button
                      onClick={openConnectModal}
                      className="bg-gray-700 text-white p-2 rounded"
                    >
                      Connect with Wallet
                    </Button>
                    {/* Web3Auth login */}
                    <Button
                      onClick={loginWithWeb3Auth}
                      className="bg-gray-700 text-white p-2 rounded"
                    >
                      Login with Web3Auth
                    </Button>
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

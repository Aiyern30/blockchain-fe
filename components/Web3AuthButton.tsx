"use client";

import { useEffect, useState, useRef } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Button } from "@/components/ui";

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

export default function Web3AuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const web3authRef = useRef<Web3Auth | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      if (!web3authRef.current) {
        web3authRef.current = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider: new EthereumPrivateKeyProvider({
            config: { chainConfig },
          }),
        });

        try {
          await web3authRef.current.initModal();
          const provider = web3authRef.current.provider;

          if (provider) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (isLoggedIn) {
              setLoggedIn(true);
              await fetchWalletAddress();
            }
          }
        } catch (error) {
          console.error("Error initializing Web3Auth:", error);
        }
      }
    };

    initWeb3Auth();
  }, []);

  const fetchWalletAddress = async () => {
    if (!web3authRef.current || !web3authRef.current.provider) return;

    try {
      const accounts = (await web3authRef.current.provider?.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Error fetching wallet address:", error);
    }
  };

  const login = async () => {
    try {
      if (web3authRef.current) {
        await web3authRef.current.connect();
        setLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        await fetchWalletAddress();
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      if (web3authRef.current) {
        await web3authRef.current.logout();
        setLoggedIn(false);
        setWalletAddress(null);
        localStorage.removeItem("isLoggedIn");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {loggedIn && walletAddress ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
          <Button onClick={logout} className="bg-red-600 text-white">
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={login} className="bg-blue-600 text-white">
          Login with Web3Auth
        </Button>
      )}
    </>
  );
}

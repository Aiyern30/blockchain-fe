"use client";

import { useEffect, useState, useRef } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Button } from "@/components/ui";

// Web3Auth Configuration
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

          // Check if a valid session exists
          const provider = web3authRef.current.provider;
          if (provider) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            if (isLoggedIn) {
              setLoggedIn(true);
            }
          }
        } catch (error) {
          console.error("Error initializing Web3Auth:", error);
        }
      }
    };

    initWeb3Auth();
  }, []);

  const login = async () => {
    try {
      if (web3authRef.current) {
        await web3authRef.current.connect();
        setLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
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
        localStorage.removeItem("isLoggedIn");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      onClick={loggedIn ? logout : login}
      className="bg-blue-600 text-white"
    >
      {loggedIn ? "Logout Web3Auth" : "Login with Web3Auth"}
    </Button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
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

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: new EthereumPrivateKeyProvider({
    config: { chainConfig },
  }),
};

const web3auth = new Web3Auth(web3AuthOptions);

export default function Web3AuthButton() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        if (web3auth.provider) {
          setProvider(web3auth.provider);
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };
    init();
  }, []);

  return (
    <Button
      onClick={loggedIn ? logout : login}
      className="bg-blue-600 text-white"
    >
      {loggedIn ? "Logout Web3Auth" : "Login with Web3Auth"}
    </Button>
  );
}

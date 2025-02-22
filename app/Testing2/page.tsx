/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState } from "react";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"; // Import the provider here
import { ToastAction } from "@/components/ui";
import RPC from "@/ethersRPC";
import Header from "../Header";

// Define the chain configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const clientId =
  "BKXvqyFuFatVMKjN353Wm0E8U1XZTu3qtxcf5E2hYAs3IPkuulenJKfNl8VULXbxaq5ZyDQ3pAljtFOUh4tnPC0"; // replace with your client ID

// Update this to properly include chainConfig
const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: new EthereumPrivateKeyProvider({
    config: { chainConfig }, // Wrap chainConfig correctly here
  }),
};

const web3auth = new Web3Auth(web3AuthOptions);

function App() {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [details, setDetails] = useState({
    address: "",
    chainID: "",
    transactionHistory: [] as any[],
    signMessage: "",
  });

  const { toast } = useToast();

  const login = async () => {
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);

      if (web3authProvider) {
        await getAccounts();
      } else {
        throw new Error("Provider is not initialized.");
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("provider", JSON.stringify(web3authProvider));

      // toast({
      //   title: "Successfully Logged In",
      //   description: "You are now logged in to your account.",
      //   color: "green",
      // });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Wallet is not ready yet")
      ) {
        toast({
          title: "Wallet Initialization Error",
          description:
            "Wallet is not ready yet, Login modal is not initialized. Please try again",
          color: "red",
        });
      } else if (
        error instanceof Error &&
        error.message.includes("User closed the modal")
      ) {
        toast({
          title: "Login Canceled",
          description: "You closed the login modal. Please try again.",
          color: "orange",
        });
      } else {
        console.error("Login failed:", error);
        toast({
          title: "Login Failed",
          description: "There was an error logging you in.",
        });
      }
    }
  };

  const logout = async () => {
    try {
      // Attempt to log out from Web3Auth
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("provider");
      localStorage.removeItem("MyAddress");
      localStorage.removeItem("MyBalance");

      toast({
        title: "Successfully Logged Out",
        description: "You have been logged out of your account.",
        action: (
          <ToastAction altText="Login again" onClick={login}>
            Login Again
          </ToastAction>
        ),
        color: "green",
      });
    } catch (error) {
      console.error("Error during logout:", error); // Log the detailed error
      toast({
        title: "Logout Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred.",
        color: "red",
      });
    }
  };

  const getAccounts = useCallback(async () => {
    if (!provider) return; // Exit if provider is not available
    try {
      const address = await RPC.getAccounts(provider);
      const balance = await RPC.getBalance(provider);
      const getChainId = await RPC.getChainId(provider);
      const getTransactionHistory = await RPC.getTransactionHistory(
        "0x978a0D289Ed468F8af4645989012f371fd347f9e"
      );
      const signMessage = await RPC.signMessage(provider);

      localStorage.setItem("MyAddress", address);
      localStorage.setItem("MyBalance", balance);

      setDetails({
        address: address,
        chainID: getChainId,
        transactionHistory: getTransactionHistory,
        signMessage: signMessage,
      });
    } catch (error) {
      console.error("Error fetching account details:", error);
      toast({
        title: "Error",
        description: "Failed to load wallet information.",
        color: "red",
      });
    }
  }, [provider, toast]);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        const isProviderReady = web3auth.provider;
        if (isProviderReady) {
          setProvider(isProviderReady);
        } else {
          console.error("Provider is not ready.");
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    // Check localStorage only if provider is not set
    if (!provider) {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const providerString = localStorage.getItem("provider");
      const providerFromStorage = providerString
        ? JSON.parse(providerString)
        : null;

      if (isLoggedIn && providerFromStorage) {
        setProvider(providerFromStorage);
        getAccounts(); // Fetch user details if already logged in
      }
    }
  }, [provider, getAccounts]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Header
        loggedIn={loggedIn}
        login={login}
        logout={logout}
        details={details}
      />
      {/* <Main /> */}
    </div>
  );
}

export default App;

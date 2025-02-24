"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const fetchTransactions = async (address: string) => {
  const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
  if (!API_KEY) {
    console.error("Missing Etherscan API key");
    return [];
  }

  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.status === "1" ? data.result : [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export default function CustomConnectButton() {
  const { address, isConnected } = useAccount();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions(address).then(setTransactions);
    }
  }, [address, isConnected]);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        return (
          <div
            className={`p-2 border rounded-lg ${
              !mounted ? "opacity-0" : "opacity-100"
            }`}
          >
            {!mounted || !account ? (
              <button
                onClick={openConnectModal}
                className="bg-blue-500 px-4 py-2 text-white rounded"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={openAccountModal}
                  className="bg-gray-800 px-4 py-2 text-white rounded flex items-center"
                >
                  {account.displayName} ({chain?.name})
                </button>

                {/* 🛠️ Transaction History inside dropdown */}
                <div className="absolute top-full left-0 bg-white shadow-lg border rounded-lg w-64 p-2 mt-2">
                  <h3 className="text-sm font-semibold mb-2">
                    Recent Transactions
                  </h3>
                  {transactions.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No transactions found
                    </p>
                  ) : (
                    <ul className="text-xs">
                      {transactions.slice(0, 5).map((tx) => (
                        <li key={tx.hash} className="border-b p-1">
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600"
                          >
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-10)}
                          </a>{" "}
                          - {tx.value / 1e18} ETH
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

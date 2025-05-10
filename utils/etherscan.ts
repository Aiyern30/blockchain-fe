/* eslint-disable @typescript-eslint/no-explicit-any */

export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export interface ProcessedTransaction {
  id: string; // This should be unique
  type: string;
  nftName: string;
  collection: string;
  price: string;
  currency: string;
  from: string;
  to: string;
  timestamp: string;
  hash: string;
  isError: boolean;
  gasUsed: string;
  gasPrice: string;
}

export async function fetchTransactions(
  address: string,
  network: "sepolia" | string = "mainnet"
): Promise<ProcessedTransaction[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!address || !apiKey) {
    throw new Error("Wallet address or API key is missing");
  }

  const baseUrl =
    network === "sepolia"
      ? "https://api-sepolia.etherscan.io"
      : "https://api.etherscan.io";

  try {
    const response = await fetch(
      `${baseUrl}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== "1") {
      throw new Error(data.message || "Failed to fetch transactions");
    }

    return processTransactions(data.result, address);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

function processTransactions(
  transactions: EtherscanTransaction[],
  address: string
): ProcessedTransaction[] {
  return transactions
    .map((tx, index) => {
      const valueInEth = Number.parseFloat(tx.value) / 1e18;
      const formattedValue = valueInEth > 0 ? valueInEth.toFixed(4) : "0";

      let type = "Transfer";
      if (tx.functionName?.includes("transfer")) {
        type = "Transfer";
      } else if (valueInEth > 0) {
        type =
          tx.from.toLowerCase() === address.toLowerCase() ? "Sent" : "Received";
      } else if (tx.input !== "0x") {
        type = "Contract Interaction";
      }

      // Create a unique ID by combining hash and index
      const uniqueId = `${tx.hash}-${index}`;

      return {
        id: uniqueId,
        type,
        nftName: "Unknown",
        collection: "Unknown",
        price: formattedValue,
        currency: "ETH",
        from: tx.from,
        to: tx.to,
        timestamp: new Date(Number.parseInt(tx.timeStamp) * 1000).toISOString(),
        hash: tx.hash,
        isError: tx.isError === "1",
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export async function fetchNFTTransfers(
  address: string,
  network: "sepolia" | string = "mainnet"
): Promise<ProcessedTransaction[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!address || !apiKey) {
    throw new Error("Wallet address or API key is missing");
  }

  const baseUrl =
    network === "sepolia"
      ? "https://api-sepolia.etherscan.io"
      : "https://api.etherscan.io";

  try {
    const erc721Response = await fetch(
      `${baseUrl}/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );
    const erc721Data = await erc721Response.json();

    let nftTransfers: any[] = [];
    if (erc721Data.status === "1") {
      nftTransfers = erc721Data.result;
    }

    const erc1155Response = await fetch(
      `${baseUrl}/api?module=account&action=token1155tx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );
    const erc1155Data = await erc1155Response.json();

    if (erc1155Data.status === "1") {
      nftTransfers = [...nftTransfers, ...erc1155Data.result];
    }

    return processNFTTransfers(nftTransfers, address);
  } catch (error) {
    console.error("Error fetching NFT transfers:", error);
    throw error;
  }
}

function processNFTTransfers(
  transfers: any[],
  address: string
): ProcessedTransaction[] {
  return transfers
    .map((transfer, index) => {
      const type =
        transfer.from.toLowerCase() === address.toLowerCase()
          ? "NFT Sent"
          : "NFT Received";

      // Create a unique ID by combining hash, type and index
      const uniqueId = `${transfer.hash}-nft-${index}`;

      return {
        id: uniqueId,
        type,
        nftName: transfer.tokenName
          ? `${transfer.tokenName} #${transfer.tokenID}`
          : `NFT #${transfer.tokenID}`,
        collection: transfer.tokenName || "Unknown Collection",
        price: "0",
        currency: "ETH",
        from: transfer.from,
        to: transfer.to,
        timestamp: new Date(
          Number.parseInt(transfer.timeStamp) * 1000
        ).toISOString(),
        hash: transfer.hash,
        isError: false,
        gasUsed: transfer.gasUsed || "0",
        gasPrice: transfer.gasPrice || "0",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export async function fetchAllTransactions(
  address: string,
  network: "sepolia" | string = "mainnet"
): Promise<ProcessedTransaction[]> {
  try {
    const [normalTxs, nftTxs] = await Promise.all([
      fetchTransactions(address, network),
      fetchNFTTransfers(address, network),
    ]);

    // Create a map to track seen transaction hashes
    const seenTxs = new Map<string, boolean>();
    const uniqueTransactions: ProcessedTransaction[] = [];

    // Process and deduplicate transactions
    [...normalTxs, ...nftTxs].forEach((tx) => {
      // If we haven't seen this exact transaction ID before, add it
      if (!seenTxs.has(tx.id)) {
        seenTxs.set(tx.id, true);
        uniqueTransactions.push(tx);
      }
    });

    return uniqueTransactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    throw error;
  }
}

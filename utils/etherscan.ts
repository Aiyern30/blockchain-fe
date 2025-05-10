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
  id: string;
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
  address: string
): Promise<ProcessedTransaction[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!address || !apiKey) {
    throw new Error("Wallet address or API key is missing");
  }

  try {
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
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
  return transactions.map((tx) => {
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

    return {
      id: tx.hash,
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
  });
}

export async function fetchNFTTransfers(
  address: string
): Promise<ProcessedTransaction[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!address || !apiKey) {
    throw new Error("Wallet address or API key is missing");
  }

  try {
    const erc721Response = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    );
    const erc721Data = await erc721Response.json();

    let nftTransfers: any[] = [];
    if (erc721Data.status === "1") {
      nftTransfers = erc721Data.result;
    }

    const erc1155Response = await fetch(
      `https://api.etherscan.io/api?module=account&action=token1155tx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
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
  return transfers.map((transfer) => {
    const type =
      transfer.from.toLowerCase() === address.toLowerCase()
        ? "NFT Sent"
        : "NFT Received";

    return {
      id: transfer.hash,
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
  });
}

export async function fetchAllTransactions(
  address: string
): Promise<ProcessedTransaction[]> {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

  if (!address || !apiKey) {
    throw new Error("Wallet address or API key is missing");
  }

  const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "1" || !Array.isArray(data.result)) {
    throw new Error(data.message || "No transactions found");
  }

  return processTransactions(data.result, address);
}

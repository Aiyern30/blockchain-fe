/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

// Function to get the connected chain ID
const getChainId = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails.chainId.toString();
  } catch (error) {
    return error as string; // Cast error to string for consistent return type
  }
};

// Function to get user's Ethereum accounts
const getAccounts = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress(); // Await the promise here
    return address;
  } catch (error) {
    return error as string; // Cast error to string for consistent return type
  }
};

// Function to get user's Ethereum balance
const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress(); // Await the promise here
    const balance = ethers.formatEther(await ethersProvider.getBalance(address));
    return balance; // Return the balance as a string
  } catch (error) {
    return error as string; // Cast error to string for consistent return type
  }
};

// Function to send Ethereum transaction
const sendTransaction = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";
    const amount = ethers.parseEther("0.001");
    const fees = await ethersProvider.getFeeData();

    const tx = await signer.sendTransaction({
      to: destination,
      value: amount,
      maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      maxFeePerGas: fees.maxFeePerGas,
    });

    const receipt = await tx.wait();
    return receipt; // Return the transaction receipt
  } catch (error) {
    return error as string; // Cast error to string for consistent return type
  }
};

// Function to sign a message
const signMessage = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    const signedMessage = await signer.signMessage(originalMessage);
    return signedMessage; // Return the signed message
  } catch (error) {
    return error as string; // Cast error to string for consistent return type
  }
}

const getTransactionHistory = async (address: string): Promise<any[]> => {
  const apiKey = "1I4Y5Q9JJ81FQI3ZUV3P382HJMXYWPM3M8";
  const url = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('API Response:', data); // Log the full response
    if (data.status === "1") {
      return data.result; // Return the list of transactions
    } else {
      console.error('Error fetching transaction history:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Fetch error:', error); // Log any fetch errors
    return [];
  }
};


// Assign the object to a variable before exporting
const RPC = {
  getChainId,
  getAccounts,
  getBalance,
  sendTransaction,
  signMessage,
  getTransactionHistory
};

export default RPC; // Export the RPC object as default
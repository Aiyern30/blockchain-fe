// src/lib/marketplaceConfig.ts

import { ethers } from "ethers";

const marketplaceAddress = "0xd637898a14E20211BFD466f1b3f8A67cbDBf748E"; // your marketplace contract

const marketplaceABI = [
  "function fetchMarketItems() view returns (tuple(address collection, uint256 tokenId, uint256 price, address seller)[])",
  "function listNFT(address collection, uint256 tokenId, uint256 price) external payable",
  "function buyNFT(address collection, uint256 tokenId) external payable",
];

// This is for your marketplace
export function getMarketplaceContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(marketplaceAddress, marketplaceABI, signerOrProvider);
}

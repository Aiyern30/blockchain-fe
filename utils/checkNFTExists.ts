import { getERC721Contract } from "@/lib/erc721Config";
import { BrowserProvider, ZeroAddress } from "ethers";

export async function checkNFTExists(
  provider: BrowserProvider,
  tokenId: number,
  ipfsHash: string
): Promise<boolean> {
  try {
    const signer = await provider.getSigner();
    const contract = getERC721Contract(signer);

    const tokenURI = await contract.tokenURI(tokenId);
    const owner = await contract.ownerOf(tokenId);

    // Compare IPFS hash with stored metadata
    if (tokenURI.includes(ipfsHash) && owner !== ZeroAddress) {
      console.log("NFT exists on blockchain");
      return true;
    }
  } catch (error) {
    console.log("NFT does not exist or error occurred:", error);
  }

  return false;
}

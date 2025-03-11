import { getERC721Contract } from "@/lib/erc721Config";
import { FetchedNFT, NFTAttribute, NFTMetadata } from "@/type/NFT";
import { ethers } from "ethers";

export async function fetchNFTsByCollectionId(collectionId: string) {
  try {
    console.log(`Fetching NFTs for collection: ${collectionId}`);

    // Normalize collectionId to handle IPFS URLs
    const normalizedCollectionId = collectionId.replace(
      "https://ipfs.io/ipfs/",
      ""
    );

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const nftContract = getERC721Contract(signer);

    const latestTokenId = await nftContract.totalSupply();
    const totalSupply = Number(latestTokenId.toString());

    console.log("Total NFTs Supply:", totalSupply);

    const nftPromises = Array.from({ length: totalSupply }, async (_, i) => {
      const tokenId = i + 1;
      try {
        const tokenURI = await nftContract.tokenURI(tokenId);
        if (!tokenURI) return null;

        const response = await fetch(tokenURI);
        if (!response.ok) return null;

        const metadata: NFTMetadata & { collection?: string } =
          await response.json();
        if (!metadata.collection) return null;

        // Normalize metadata collection ID
        const metadataCollectionId = metadata.collection.replace(
          "https://ipfs.io/ipfs/",
          ""
        );
        if (metadataCollectionId !== normalizedCollectionId) return null;

        return {
          id: tokenURI.replace("https://ipfs.io/ipfs/", ""),
          title: metadata.name || `NFT #${tokenId}`,
          image: metadata.image || "",
          floor:
            metadata.attributes?.find(
              (attr: NFTAttribute) => attr.trait_type === "Price"
            )?.value || "N/A",
        };
      } catch (error) {
        console.warn(`Error fetching NFT ${tokenId}:`, error);
        return null;
      }
    });

    const fetchedNFTs = (await Promise.all(nftPromises)).filter(
      Boolean
    ) as FetchedNFT[];

    console.log(`Fetched NFTs for collection ${collectionId}:`, fetchedNFTs);
    return fetchedNFTs;
  } catch (error) {
    console.error("Error fetching NFTs by collection:", error);
    return [];
  }
}

export const formatImageUrl = (imageUrl: string) => {
  if (!imageUrl) return "/placeholder.svg";

  if (imageUrl.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${imageUrl.replace("ipfs://", "")}`;
  }

  if (imageUrl.includes("gateway.pinata.cloud/ipfs/")) {
    return imageUrl;
  }

  return imageUrl;
};

export const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

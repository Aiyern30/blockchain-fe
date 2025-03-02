export const formatAddress = (address?: string) => {
  if (!address) return "Not Connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getIpfsUrl = (cidOrUrl?: string): string => {
  if (!cidOrUrl) return "/placeholder.svg"; // Default placeholder image

  // If the input already starts with "http" (a full URL), return as is
  if (cidOrUrl.startsWith("http")) return cidOrUrl;

  // If the input starts with "ipfs://", extract the CID
  if (cidOrUrl.startsWith("ipfs://")) {
    cidOrUrl = cidOrUrl.replace("ipfs://", "");
  }

  // Return a valid IPFS Gateway URL
  return `https://dweb.link/ipfs/${cidOrUrl}`;
};

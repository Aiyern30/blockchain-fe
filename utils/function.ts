export const formatAddress = (address?: string) => {
  if (!address) return "Not Connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getIpfsUrl = (cidOrUrl?: string): string => {
  if (!cidOrUrl) return "/placeholder.svg";

  if (cidOrUrl.startsWith("http")) return cidOrUrl;

  if (cidOrUrl.startsWith("ipfs://")) {
    cidOrUrl = cidOrUrl.replace("ipfs://", "");
  }

  return `https://dweb.link/ipfs/${cidOrUrl}`;
};

export function extractCID(url: string): string {
  const match = url.match(/(?:ipfs:\/\/|https?:\/\/.*?\/ipfs\/)([a-zA-Z0-9]+)/);
  return match ? match[1] : url;
}

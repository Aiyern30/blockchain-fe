export const formatAddress = (address?: string) => {
  if (!address) return "Not Connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

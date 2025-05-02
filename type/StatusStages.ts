export const STATUS_STAGES = {
  idle: { label: "Idle", duration: 0 },
  checking: { label: "Checking Wallet", duration: 1500 },
  uploading: { label: "Uploading to IPFS", duration: 2000 },
  minting: { label: "Minting on Blockchain", duration: 2500 },
  exists: { label: "NFT Already Exists", duration: 0 },
  done: { label: "Minting Complete", duration: 0 },
  cancelled: { label: "Transaction Cancelled", duration: 0 },
  error: { label: "Error Occurred", duration: 0 },
};
